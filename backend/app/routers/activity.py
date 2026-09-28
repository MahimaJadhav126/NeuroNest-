from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Intention, FocusSession, CognitiveAttempt, MusicSession, MoodLog, JournalEntry, WellnessSession, ChatMessage
from ..schemas import IntentionIn, IntentionUpdate, FocusIn, FocusCompleteIn, CognitiveIn, MusicIn, MoodIn, JournalIn, WellnessIn, ChatIn
from ..security import current_user

router = APIRouter(prefix="/api", tags=["NeuroNest"])

@router.post("/intentions")
def create_intention(data: IntentionIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = Intention(user_id=user.id, text=data.text)
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.get("/intentions/today")
def today_intention(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Intention).filter(Intention.user_id == user.id).order_by(Intention.created_at.desc()).first()

@router.patch("/intentions/{item_id}")
def update_intention(item_id: int, data: IntentionUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.query(Intention).filter(Intention.id == item_id, Intention.user_id == user.id).first()
    if not item: raise HTTPException(404, "Intention not found")
    item.achieved = data.achieved; db.commit(); db.refresh(item); return item

@router.post("/focus")
def create_focus(data: FocusIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = FocusSession(user_id=user.id, task=data.task, planned_minutes=data.planned_minutes)
    db.add(item); db.commit(); db.refresh(item); return item

@router.patch("/focus/{item_id}")
def complete_focus(item_id: int, data: FocusCompleteIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.query(FocusSession).filter(FocusSession.id == item_id, FocusSession.user_id == user.id).first()
    if not item: raise HTTPException(404, "Focus session not found")
    item.actual_minutes = data.actual_minutes; item.completed = data.completed
    db.commit(); db.refresh(item); return item

@router.post("/cognitive")
def cognitive(data: CognitiveIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = CognitiveAttempt(user_id=user.id, **data.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item

@router.post("/music")
def music(data: MusicIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = MusicSession(user_id=user.id, **data.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item

@router.post("/mood")
def mood(data: MoodIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = MoodLog(user_id=user.id, mood=data.mood)
    db.add(item); db.commit(); db.refresh(item); return item

@router.post("/journal")
def journal(data: JournalIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = JournalEntry(user_id=user.id, content=data.content)
    db.add(item); db.commit(); db.refresh(item); return item

@router.get("/journal")
def journals(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(JournalEntry).filter(JournalEntry.user_id == user.id).order_by(JournalEntry.created_at.desc()).limit(50).all()

@router.post("/wellness")
def wellness(data: WellnessIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = WellnessSession(user_id=user.id, **data.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item

@router.post("/chat")
def chat(
    data: ChatIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    message = data.message.strip()
    t = message.lower()

    # Save user's message first
    user_msg = ChatMessage(
        user_id=user.id,
        role="user",
        content=message
    )
    db.add(user_msg)
    db.flush()

    # Get a little recent conversation context
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(8)
        .all()
    )

    previous_user_messages = [
        x.content.lower()
        for x in history
        if x.role == "user" and x.content.lower() != t
    ]

    repeated = any(
        any(keyword in old for keyword in [
            "stress", "stressed", "lonely", "alone",
            "focus", "sad", "overthink", "exam"
        ])
        for old in previous_user_messages
    )

    # ---------------------------------------------------------
    # SAFETY
    # ---------------------------------------------------------
    if any(x in t for x in [
        "kill myself",
        "suicide",
        "want to die",
        "hurt myself",
        "self harm",
        "self-harm"
    ]):
        reply = (
            "I'm really glad you told me. I don't want you to handle "
            "something this intense alone. Please reach out to someone "
            "you trust and, if possible, stay with another person right now. "
            "If you think you might act on these thoughts or you're in "
            "immediate danger, contact your local emergency service or a "
            "local crisis service now. I can stay here and listen, but I "
            "shouldn't be your only source of support."
        )

    # ---------------------------------------------------------
    # LONELINESS
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "lonely",
        "alone",
        "nobody",
        "no one",
        "isolated",
        "feel ignored"
    ]):
        if repeated:
            reply = (
                "You mentioned feeling alone earlier too. It sounds like "
                "this feeling is still sitting with you. You don't have to "
                "solve it immediately. Do you want to tell me what happened "
                "today that made the loneliness feel stronger?"
            )
        else:
            reply = (
                "I'm here with you. Feeling lonely can be surprisingly heavy, "
                "especially when you don't feel understood. You don't have to "
                "make the conversation productive. What would feel better "
                "right now — telling me what happened, talking about what's "
                "on your mind, or simply having some company for a while?"
            )

    # ---------------------------------------------------------
    # STRESS
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "stress",
        "stressed",
        "pressure",
        "overwhelmed",
        "too much"
    ]):
        if repeated:
            reply = (
                "I hear you — the stress seems to be sticking around. "
                "Let's not try to fix everything at once. What is the "
                "biggest source of pressure right now: studies, deadlines, "
                "relationships, or something else?"
            )
        else:
            reply = (
                "That sounds like a lot to carry at once. Let's slow it down "
                "for a moment. Take one comfortable breath, then tell me: "
                "what is the one thing causing the most pressure right now?"
            )

    # ---------------------------------------------------------
    # FOCUS / PROCRASTINATION
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "focus",
        "can't study",
        "cannot study",
        "procrastinating",
        "procrastination",
        "distracted",
        "concentrate"
    ]):
        if repeated:
            reply = (
                "You're still having trouble getting into focus mode. "
                "Let's make the target smaller instead of forcing yourself "
                "through a long session. What are you trying to work on "
                "right now? Tell me the task in one sentence."
            )
        else:
            reply = (
                "Let's make this easier rather than harder. Pick one tiny "
                "starting action — open the notes, write the first line, "
                "or solve one question. What are you trying to get done "
                "right now?"
            )

    # ---------------------------------------------------------
    # STUDY / EXAM PRESSURE
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "exam",
        "exams",
        "semester",
        "assignment",
        "college",
        "study",
        "studying",
        "syllabus"
    ]):
        reply = (
            "Academic pressure can make even simple tasks feel huge. "
            "Let's break it down instead of thinking about the entire "
            "semester. What subject or assignment is worrying you most?"
        )

    # ---------------------------------------------------------
    # SAD / LOW MOOD
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "sad",
        "upset",
        "crying",
        "cry",
        "down",
        "empty",
        "bad day"
    ]):
        reply = (
            "I'm sorry today feels heavy. You don't need to turn it into "
            "a positive moment immediately. You can tell me what happened, "
            "or we can simply slow things down and talk about what's going "
            "through your mind."
        )

    # ---------------------------------------------------------
    # ANXIETY / OVERTHINKING
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "anxious",
        "anxiety",
        "overthinking",
        "overthink",
        "worried",
        "worry",
        "nervous",
        "panic"
    ]):
        reply = (
            "It sounds like your thoughts are running faster than you'd "
            "like. Let's take one thought at a time. What is the main thing "
            "your mind keeps returning to?"
        )

    # ---------------------------------------------------------
    # TIRED / BURNOUT
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "tired",
        "exhausted",
        "burnout",
        "burned out",
        "sleepy",
        "no energy"
    ]):
        reply = (
            "It sounds like your energy is running low. Instead of pushing "
            "harder immediately, let's check what you need. Have you been "
            "physically tired, mentally tired, or both?"
        )

    # ---------------------------------------------------------
    # POSITIVE / CELEBRATION
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "happy",
        "good",
        "great",
        "excited",
        "proud",
        "finished",
        "done"
    ]):
        reply = (
            "I like hearing that 🌿. You deserve to notice the progress, "
            "even when it feels small. What happened that made you feel "
            "good today?"
        )

    # ---------------------------------------------------------
    # USER WANTS TO TALK
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "just need to talk",
        "need to talk",
        "talk to someone",
        "can i talk",
        "i want to talk"
    ]):
        reply = (
            "Of course. You don't need to have a perfectly worded problem "
            "here. Start wherever feels easiest — what has been on your "
            "mind lately?"
        )

    # ---------------------------------------------------------
    # GENERAL CONVERSATION
    # ---------------------------------------------------------
    elif any(x in t for x in [
        "hello",
        "hi",
        "hey"
    ]):
        reply = (
            "Hey 🌿 I'm here. What's been taking up most of your mental "
            "space today?"
        )

    elif t in ["yes", "yeah", "yep", "maybe"]:
        reply = (
            "Okay. We can take it one step at a time. Tell me a little "
            "more about what you're feeling, in your own words."
        )

    elif t in ["no", "nope", "not really"]:
        reply = (
            "That's okay. You don't have to force an answer. We can start "
            "somewhere else. What feels easiest to talk about?"
        )

    else:
        reply = (
            "I'm listening 🌿. Tell me a little more about that. "
            "What happened, and how did it make you feel?"
        )

    # Save assistant response
    assistant_msg = ChatMessage(
        user_id=user.id,
        role="assistant",
        content=reply
    )

    db.add(assistant_msg)
    db.commit()

    return {"reply": reply}

@router.get("/analytics")
def analytics(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta

    # Overall totals
    focus = (
        db.query(
            func.coalesce(
                func.sum(FocusSession.actual_minutes), 0
            )
        )
        .filter(
            FocusSession.user_id == user.id,
            FocusSession.completed == True
        )
        .scalar()
    )

    avg_memory = (
        db.query(func.avg(CognitiveAttempt.accuracy))
        .filter(
            CognitiveAttempt.user_id == user.id,
            CognitiveAttempt.task_type == "Memory"
        )
        .scalar()
    )

    journal_count = (
        db.query(func.count(JournalEntry.id))
        .filter(JournalEntry.user_id == user.id)
        .scalar()
    )

    music_minutes = (
        db.query(
            func.coalesce(
                func.sum(MusicSession.minutes), 0
            )
        )
        .filter(MusicSession.user_id == user.id)
        .scalar()
    )

    wellness_minutes = (
        db.query(
            func.coalesce(
                func.sum(WellnessSession.minutes), 0
            )
        )
        .filter(WellnessSession.user_id == user.id)
        .scalar()
    )

    # ---------------------------------------------------------
    # LAST 7 DAYS
    # ---------------------------------------------------------

    today = datetime.utcnow().date()

    weekly = []

    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)

        start = datetime.combine(day, datetime.min.time())
        end = start + timedelta(days=1)

        focus_day = (
            db.query(
                func.coalesce(
                    func.sum(FocusSession.actual_minutes), 0
                )
            )
            .filter(
                FocusSession.user_id == user.id,
                FocusSession.completed == True,
                FocusSession.created_at >= start,
                FocusSession.created_at < end
            )
            .scalar()
        )

        music_day = (
            db.query(
                func.coalesce(
                    func.sum(MusicSession.minutes), 0
                )
            )
            .filter(
                MusicSession.user_id == user.id,
                MusicSession.created_at >= start,
                MusicSession.created_at < end
            )
            .scalar()
        )

        wellness_day = (
            db.query(
                func.coalesce(
                    func.sum(WellnessSession.minutes), 0
                )
            )
            .filter(
                WellnessSession.user_id == user.id,
                WellnessSession.created_at >= start,
                WellnessSession.created_at < end
            )
            .scalar()
        )

        journal_day = (
            db.query(func.count(JournalEntry.id))
            .filter(
                JournalEntry.user_id == user.id,
                JournalEntry.created_at >= start,
                JournalEntry.created_at < end
            )
            .scalar()
        )

        cognitive_day = (
            db.query(func.count(CognitiveAttempt.id))
            .filter(
                CognitiveAttempt.user_id == user.id,
                CognitiveAttempt.created_at >= start,
                CognitiveAttempt.created_at < end
            )
            .scalar()
        )

        total_minutes = (
            int(focus_day or 0)
            + int(music_day or 0)
            + int(wellness_day or 0)
        )

        total_activities = (
            int(journal_day or 0)
            + int(cognitive_day or 0)
        )

        weekly.append({
            "date": day.isoformat(),
            "day": day.strftime("%a"),
            "focus_minutes": int(focus_day or 0),
            "music_minutes": int(music_day or 0),
            "wellness_minutes": int(wellness_day or 0),
            "total_minutes": total_minutes,
            "activities": total_activities
        })

    # ---------------------------------------------------------
    # RECENT ACTIVITY
    # ---------------------------------------------------------

    recent = []

    recent_focus = (
        db.query(FocusSession)
        .filter(FocusSession.user_id == user.id)
        .order_by(FocusSession.created_at.desc())
        .limit(5)
        .all()
    )

    for item in recent_focus:
        recent.append({
            "type": "Focus",
            "icon": "◷",
            "title": item.task,
            "detail": f"{int(item.actual_minutes or 0)} min",
            "created_at": item.created_at.isoformat()
                if item.created_at else None
        })

    recent_memory = (
        db.query(CognitiveAttempt)
        .filter(
            CognitiveAttempt.user_id == user.id
        )
        .order_by(CognitiveAttempt.created_at.desc())
        .limit(5)
        .all()
    )

    for item in recent_memory:
        recent.append({
            "type": item.task_type,
            "icon": "🧠",
            "title": f"{item.task_type} activity",
            "detail": f"{float(item.accuracy):.0f}%",
            "created_at": item.created_at.isoformat()
                if item.created_at else None
        })

    recent_journal = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(5)
        .all()
    )

    for item in recent_journal:
        recent.append({
            "type": "Journal",
            "icon": "▤",
            "title": "Journal reflection",
            "detail": (
                item.content[:55] + "..."
                if len(item.content) > 55
                else item.content
            ),
            "created_at": item.created_at.isoformat()
                if item.created_at else None
        })

    recent_music = (
        db.query(MusicSession)
        .filter(MusicSession.user_id == user.id)
        .order_by(MusicSession.created_at.desc())
        .limit(5)
        .all()
    )

    for item in recent_music:
        recent.append({
            "type": "Music",
            "icon": "♫",
            "title": item.track,
            "detail": f"{int(item.minutes or 0)} min",
            "created_at": item.created_at.isoformat()
                if item.created_at else None
        })

    recent_wellness = (
        db.query(WellnessSession)
        .filter(WellnessSession.user_id == user.id)
        .order_by(WellnessSession.created_at.desc())
        .limit(5)
        .all()
    )

    for item in recent_wellness:
        recent.append({
            "type": "Wellness",
            "icon": "◌",
            "title": item.mode,
            "detail": f"{int(item.minutes or 0)} min",
            "created_at": item.created_at.isoformat()
                if item.created_at else None
        })

    recent.sort(
        key=lambda x: x["created_at"] or "",
        reverse=True
    )

    return {
        "focus_minutes": int(focus or 0),
        "memory_accuracy": round(
            float(avg_memory or 0), 1
        ),
        "journal_entries": int(journal_count or 0),
        "music_minutes": int(music_minutes or 0),
        "wellness_minutes": int(wellness_minutes or 0),
        "weekly": weekly,
        "recent_activity": recent[:10]
    }