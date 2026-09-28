import React,{useEffect,useState,useRef} from "react";
import {createRoot} from "react-dom/client";
import {api} from "./api";
import "./styles.css";

const nav=[["Home","⌂"],["NeuroLab","🧠"],["Focus","◷"],["Music","♫"],["Swaas & Jaap","◌"],["Journal","▤"],["NeuroSaathi","◉"],["Analytics","⌁"]];

function App(){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem("neuronest_user")||"null"));
  const [page,setPage]=useState("Home");
  if(!user)return <Auth onDone={u=>setUser(u)}/>;
  const logout=()=>{localStorage.clear();setUser(null)};
  return <div className="shell"><aside><button className="brand" onClick={()=>setPage("Home")}><b>✦</b><span>NeuroNest<small>Focus • Learn • Grow</small></span></button>{nav.map(([n,i])=><button className={"nav "+(page===n?"active":"")} onClick={()=>setPage(n)} key={n}>{i}<span>{n}</span></button>)}<div className="sidebottom"><button
  className={"nav "+(page==="Settings"?"active":"")}
  onClick={()=>setPage("Settings")}
>
  ⚙<span>Settings</span>
</button><button className="user" onClick={logout}><i>{user.name?.[0]?.toUpperCase()}</i><span>{user.name}<small>Sign out</small></span></button></div></aside><main><div className="mobilebar"><b>✦ NeuroNest</b></div>{page==="Home"&&<Home user={user} setPage={setPage}/>} {page==="NeuroLab"&&<NeuroLab/>}{page==="Focus"&&<Focus/>}{page==="Music"&&<Music/>}{page==="Swaas & Jaap"&&<Wellness/>}{page==="Journal"&&<Journal/>}{page==="NeuroSaathi"&&<Chat/>}{page==="Analytics"&&<Analytics/>}{page==="Settings"&&<Settings user={user} setPage={setPage}/>}</main></div>
}

function Auth({onDone}){
 const [register,setRegister]=useState(false),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 const submit=async e=>{e.preventDefault();setBusy(true);setErr("");try{const d=register?await api.register({name,email,password}):await api.login({email,password});localStorage.setItem("neuronest_token",d.access_token);localStorage.setItem("neuronest_user",JSON.stringify(d.user));onDone(d.user)}catch(x){setErr(x.message)}finally{setBusy(false)}};
 return <div className="auth"><div className="authart"><div className="brain">🧠</div><h1>NeuroNest</h1><p>A calmer mind. A brighter you.</p><span>Focus • Learn • Grow</span></div><form className="authbox" onSubmit={submit}><div className="logo">✦</div><h2>{register?"Create Your Account":"Welcome Back"}</h2><p>{register?"Start your journey towards a healthier mind.":"Sign in to continue your journey."}</p>{register&&<input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required/>}<input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength="6" required/>{err&&<div className="error">{err}</div>}<button className="primary" disabled={busy}>{busy?"Please wait…":register?"Register":"Login"}</button><p className="switch">{register?"Already have an account?":"Don't have an account?"}<button type="button" onClick={()=>setRegister(!register)}> {register?"Login":"Create one"}</button></p></form></div>
}

function Header({title,sub}){return <div className="header"><div><h1>{title}</h1><p>{sub}</p></div></div>}
function Home({user,setPage}){
  const [intent,setIntent]=useState("Study & Learn");
  const [mood,setMood]=useState("Calm");
  const [analytics,setAnalytics]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    api.analytics()
      .then(setAnalytics)
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const saveMood=async m=>{
    setMood(m);

    try{
      await api.mood(m);
    }catch{}
  };

  const saveIntent=async()=>{
    try{
      await api.intention.create(intent);
      setSaved(true);

      setTimeout(()=>{
        setSaved(false);
      },2000);

    }catch(e){
      alert(e.message);
    }
  };

  const features=[
    ["Focus","◷","Beat distractions and build focused habits.","Focus"],
    ["NeuroLab","🧠","Explore memory, attention and switching.","NeuroLab"],
    ["Music","♫","Create a sound environment for your session.","Music"],
    ["Swaas & Jaap","◌","Breathe, chant and create a mindful pause.","Swaas & Jaap"],
    ["Journal","▤","Write, reflect and keep your thoughts private.","Journal"],
    ["NeuroSaathi","◉","Talk, reflect and take one small next step.","NeuroSaathi"]
  ];

  const moods=[
    ["Great","😄"],
    ["Calm","🙂"],
    ["Okay","😐"],
    ["Low","😕"],
    ["Tired","😣"]
  ];

  return(
    <>
      <div className="welcome home-welcome">

        <div>
          <div className="welcome-eyebrow">
            ✦ YOUR PERSONAL SPACE
          </div>

          <h1>
            Good morning, {user.name} 🌿
          </h1>

          <p>
            Small steps create meaningful changes.
          </p>
        </div>

        <span className="badge">
          🔒 Private journey
        </span>

      </div>

      {/* INTENTION + MOOD */}

      <div className="twocol home-top">

        <div className="card mint intention-card">

          <div className="section-label">
            ◎ TODAY'S INTENTION
          </div>

          <h2>
            {intent}
          </h2>

          <p>
            Choose what deserves your attention right now.
          </p>

          <div className="chips">

            {[
              "Study & Learn",
              "Deep Work",
              "Relax & Reset"
            ].map(x=>(
              <button
                className={
                  x===intent
                    ? "chip active"
                    : "chip"
                }
                onClick={()=>setIntent(x)}
                key={x}
              >
                {x}
              </button>
            ))}

          </div>

          <button
            className="primary small"
            onClick={saveIntent}
          >
            {saved ? "✓ Intention Saved" : "Save Intention"}
          </button>

        </div>

        <div className="card mood-card">

          <div className="section-label">
            HOW ARE YOU FEELING?
          </div>

          <p>
            Check in with yourself before you begin.
          </p>

          <div className="moods">

            {moods.map(([name,emoji])=>(
              <button
                className={
                  mood===name
                    ? "sel"
                    : ""
                }
                onClick={()=>saveMood(name)}
                key={name}
                title={name}
              >
                {emoji}
              </button>
            ))}

          </div>

          <div className="current-mood">
            <span>Current mood</span>
            <b>{mood}</b>
          </div>

        </div>

      </div>

      {/* FEATURE GRID */}

      <div className="home-section-heading">

        <div>
          <h2>Explore NeuroNest</h2>
          <p>
            Choose a space based on what you need right now.
          </p>
        </div>

      </div>

      <div className="tiles home-tiles">

        {features.map(([title,icon,description,pageName])=>(
          <button
            className="tile"
            onClick={()=>setPage(pageName)}
            key={title}
          >
            <b>{icon}</b>

            <strong>{title}</strong>

            <small>{description}</small>

            <span className="tile-arrow">
              →
            </span>
          </button>
        ))}

      </div>

      {/* REAL PROGRESS */}

      <div className="home-section-heading progress-heading">

        <div>
          <h2>Your Progress</h2>
          <p>
            Based on your activity recorded in NeuroNest.
          </p>
        </div>

        <button
          className="text-button"
          onClick={()=>setPage("Analytics")}
        >
          View Analytics →
        </button>

      </div>

      <div className="card progress home-progress">

        {loading ? (

          <div className="home-loading">
            Loading your progress...
          </div>

        ) : (

          <div className="stats">

            <Stat
              v={(analytics?.focus_minutes??0)+" min"}
              l="Focus Time"
            />

            <Stat
              v={(analytics?.memory_accuracy??0)+"%"}
              l="Memory Accuracy"
            />

            <Stat
              v={analytics?.journal_entries??0}
              l="Journal Entries"
            />

            <Stat
              v={(analytics?.wellness_minutes??0)+" min"}
              l="Wellness Time"
            />

          </div>

        )}

      </div>

      {/* RECENT ACTIVITY */}

      <div className="home-section-heading recent-heading">

        <div>
          <h2>Recent Activity</h2>
          <p>
            A quick look at your latest sessions.
          </p>
        </div>

      </div>

      <div className="card recent-home-card">

        {analytics?.recent_activity?.length ? (

          <div className="home-recent-list">

            {analytics.recent_activity
              .slice(0,5)
              .map((item,index)=>(
                <div
                  className="home-recent-item"
                  key={
                    `${item.type}-${item.created_at}-${index}`
                  }
                >

                  <div className="home-recent-icon">
                    {item.icon}
                  </div>

                  <div className="home-recent-content">

                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.type} · {item.detail}
                    </span>

                  </div>

                  <small>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            day:"numeric",
                            month:"short"
                          }
                        )
                      : ""}
                  </small>

                </div>
              ))}

          </div>

        ) : (

          <div className="home-empty">

            <div>🌱</div>

            <h3>
              Your journey starts here
            </h3>

            <p>
              Try a focus session, NeuroLab activity,
              journal entry, or wellness practice.
            </p>

          </div>

        )}

      </div>

    </>
  );
}
function Stat({v,l}){return <div className="stat"><b>{v}</b><small>{l}</small></div>}

function NeuroLab(){
  const [task,setTask]=useState("Memory");

  // ---------------- MEMORY ----------------
  const memoryWords=[
    "APPLE",
    "RIVER",
    "CHAIR",
    "MANGO",
    "CLOCK"
  ];

  const decoyWords=[
    "TRAIN",
    "BIRD",
    "TABLE"
  ];

  const [memoryPhase,setMemoryPhase]=useState("ready");
  const [selectedWords,setSelectedWords]=useState([]);
  const [memoryScore,setMemoryScore]=useState(null);

  // ---------------- ATTENTION ----------------
  const [attentionRunning,setAttentionRunning]=useState(false);
  const [attentionRound,setAttentionRound]=useState(0);
  const [attentionHits,setAttentionHits]=useState(0);
  const [attentionFalseClicks,setAttentionFalseClicks]=useState(0);
  const [attentionTarget,setAttentionTarget]=useState("wait");
  const [reaction,setReaction]=useState(null);
  const [attentionScore,setAttentionScore]=useState(null);

  const attentionStartRef=useRef(null);
  const attentionTimerRef=useRef(null);

  // ---------------- TASK SWITCHING ----------------
  const [switchRound,setSwitchRound]=useState(0);
  const [switchScore,setSwitchScore]=useState(0);
  const [switchRunning,setSwitchRunning]=useState(false);
  const [switchQuestion,setSwitchQuestion]=useState(null);
  const [switchResult,setSwitchResult]=useState(null);

  const totalSwitchRounds=8;

  useEffect(()=>{
    return()=>{
      clearTimeout(attentionTimerRef.current);
    };
  },[]);

  // ------------------------------------------------
  // RESET
  // ------------------------------------------------

  const resetAll=()=>{
    clearTimeout(attentionTimerRef.current);

    setMemoryPhase("ready");
    setSelectedWords([]);
    setMemoryScore(null);

    setAttentionRunning(false);
    setAttentionRound(0);
    setAttentionHits(0);
    setAttentionFalseClicks(0);
    setAttentionTarget("wait");
    setReaction(null);
    setAttentionScore(null);

    setSwitchRound(0);
    setSwitchScore(0);
    setSwitchRunning(false);
    setSwitchQuestion(null);
    setSwitchResult(null);
  };

  const changeTask=(newTask)=>{
    resetAll();
    setTask(newTask);
  };

  // ------------------------------------------------
  // MEMORY
  // ------------------------------------------------

  const startMemory=()=>{
    setMemoryScore(null);
    setSelectedWords([]);
    setMemoryPhase("show");

    setTimeout(()=>{
      setMemoryPhase("recall");
    },4000);
  };

  const toggleMemoryWord=(word)=>{
    if(memoryPhase!=="recall") return;

    setSelectedWords(current=>{
      if(current.includes(word)){
        return current.filter(x=>x!==word);
      }

      return [...current,word];
    });
  };

  const finishMemory=async()=>{
    const correct=selectedWords.filter(
      word=>memoryWords.includes(word)
    ).length;

    const wrong=selectedWords.filter(
      word=>!memoryWords.includes(word)
    ).length;

    const accuracy=Math.max(
      0,
      Math.round(
        ((correct-wrong*0.5)/memoryWords.length)*100
      )
    );

    setMemoryScore(accuracy);
    setMemoryPhase("result");

    try{
      await api.cognitive({
        task_type:"Memory",
        accuracy,
        reaction_ms:4000
      });
    }catch{}
  };

  // ------------------------------------------------
  // ATTENTION
  // ------------------------------------------------

  const startAttentionRound=()=>{
    clearTimeout(attentionTimerRef.current);

    setAttentionTarget("wait");
    setReaction(null);

    const delay=1000+Math.random()*2500;

    attentionTimerRef.current=setTimeout(()=>{
      setAttentionTarget("green");
      attentionStartRef.current=performance.now();
    },delay);
  };

  const startAttention=()=>{
    setAttentionRunning(true);
    setAttentionRound(1);
    setAttentionHits(0);
    setAttentionFalseClicks(0);
    setAttentionScore(null);

    startAttentionRound();
  };

  const clickAttention=()=>{
    if(!attentionRunning) return;

    // User clicked too early
    if(attentionTarget!=="green"){
      const falseClicks=attentionFalseClicks+1;

      setAttentionFalseClicks(falseClicks);
      setAttentionTarget("red");

      setTimeout(()=>{
        if(attentionRound>=5){
          const finalScore=Math.max(
            0,
            Math.round(
              ((attentionHits-falseClicks)*20)
            )
          );

          setAttentionScore(finalScore);
          setAttentionRunning(false);

          api.cognitive({
            task_type:"Attention",
            accuracy:finalScore,
            reaction_ms:reaction||0
          }).catch(()=>{});
        }else{
          setAttentionRound(r=>r+1);
          startAttentionRound();
        }
      },700);

      return;
    }

    // Correct click
    const reactionTime=Math.round(
      performance.now()-attentionStartRef.current
    );

    setReaction(reactionTime);

    const hits=attentionHits+1;
    setAttentionHits(hits);

    if(attentionRound>=5){

      const finalScore=Math.max(
        0,
        Math.round(
          ((hits-attentionFalseClicks)*20)
        )
      );

      setAttentionScore(finalScore);
      setAttentionRunning(false);

      api.cognitive({
        task_type:"Attention",
        accuracy:finalScore,
        reaction_ms:reactionTime
      }).catch(()=>{});

    }else{

      setTimeout(()=>{
        setAttentionRound(r=>r+1);
        startAttentionRound();
      },700);
    }
  };

  // ------------------------------------------------
  // TASK SWITCHING
  // ------------------------------------------------

  const createSwitchQuestion=()=>{
    const useColor=Math.random()>0.5;

    if(useColor){

      const colors=["RED","BLUE"];
      const correct=colors[Math.floor(Math.random()*2)];

      setSwitchQuestion({
        rule:"Choose the COLOR shown below.",
        value:correct,
        options:colors,
        correct
      });

    }else{

      const numbers=[
        Math.floor(Math.random()*9)+1
      ];

      const number=numbers[0];

      setSwitchQuestion({
        rule:"Is the number EVEN or ODD?",
        value:String(number),
        options:["EVEN","ODD"],
        correct:number%2===0?"EVEN":"ODD"
      });
    }
  };

  const startSwitching=()=>{
    setSwitchRunning(true);
    setSwitchRound(1);
    setSwitchScore(0);
    setSwitchResult(null);
    createSwitchQuestion();
  };

  const answerSwitch=(answer)=>{
    if(!switchRunning || !switchQuestion) return;

    const correct=answer===switchQuestion.correct;
    const newScore=switchScore+(correct?1:0);

    setSwitchScore(newScore);

    if(switchRound>=totalSwitchRounds){

      const accuracy=Math.round(
        (newScore/totalSwitchRounds)*100
      );

      setSwitchResult(accuracy);
      setSwitchRunning(false);

      api.cognitive({
        task_type:"Task Switching",
        accuracy,
        reaction_ms:1000
      }).catch(()=>{});

    }else{

      setSwitchRound(r=>r+1);

      setTimeout(()=>{
        createSwitchQuestion();
      },500);
    }
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return(
    <>
      <Header
        title="NeuroLab"
        sub="Short exploratory activities for memory, attention and task switching — not diagnostic tests."
      />

      <div className="tabs">
        {["Memory","Attention","Task Switching"].map(x=>(
          <button
            key={x}
            className={task===x?"active":""}
            onClick={()=>changeTask(x)}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="twocol">

        {/* ================= MAIN TEST ================= */}

        <div className="card task">

          {/* MEMORY */}

          {task==="Memory" && (
            <>
              {memoryPhase==="ready" && (
                <>
                  <div className="neuro-icon">🧠</div>

                  <h2>Memory Challenge</h2>

                  <p>
                    You will see five words for a few seconds.
                    Try to remember them.
                  </p>

                  <button
                    className="primary"
                    onClick={startMemory}
                  >
                    Start Memory Test
                  </button>
                </>
              )}

              {memoryPhase==="show" && (
                <>
                  <h2>Remember these words</h2>

                  <p>Look carefully. You have 4 seconds.</p>

                  <div className="memory-grid">
                    {memoryWords.map(word=>(
                      <div
                        className="memory-word"
                        key={word}
                      >
                        {word}
                      </div>
                    ))}
                  </div>

                  <div className="countdown-message">
                    Remember...
                  </div>
                </>
              )}

              {memoryPhase==="recall" && (
                <>
                  <h2>What do you remember?</h2>

                  <p>
                    Select the words you saw earlier.
                  </p>

                  <div className="memory-grid">

                    {[...memoryWords,...decoyWords]
                      .sort()
                      .map(word=>(
                        <button
                          key={word}
                          className={
                            selectedWords.includes(word)
                              ? "memory-option selected"
                              : "memory-option"
                          }
                          onClick={()=>toggleMemoryWord(word)}
                        >
                          {word}
                        </button>
                      ))
                    }

                  </div>

                  <button
                    className="primary"
                    onClick={finishMemory}
                    disabled={!selectedWords.length}
                  >
                    Check My Memory
                  </button>
                </>
              )}

              {memoryPhase==="result" && (
                <>
                  <div className="success-icon">✓</div>

                  <h2>Memory Test Complete</h2>

                  <div className="score-number">
                    {memoryScore}%
                  </div>

                  <p>
                    This is an exploratory score for observing
                    your own activity over time.
                  </p>

                  <button
                    className="primary"
                    onClick={resetAll}
                  >
                    Try Again
                  </button>
                </>
              )}
            </>
          )}

          {/* ATTENTION */}

          {task==="Attention" && (
            <>
              {!attentionRunning && attentionScore===null && (
                <>
                  <div className="neuro-icon">⚡</div>

                  <h2>Attention Reaction Test</h2>

                  <p>
                    Wait for the circle to turn green.
                    Click as quickly as you can.
                  </p>

                  <div className="attention-rules">
                    <span>5 rounds</span>
                    <span>•</span>
                    <span>Reaction time measured</span>
                  </div>

                  <button
                    className="primary"
                    onClick={startAttention}
                  >
                    Start Attention Test
                  </button>
                </>
              )}

              {attentionRunning && (
                <>
                  <h2>Stay focused</h2>

                  <p>
                    Round {attentionRound} of 5
                  </p>

                  <button
                    className={
                      attentionTarget==="green"
                        ? "attention-target green"
                        : attentionTarget==="red"
                        ? "attention-target red"
                        : "attention-target waiting"
                    }
                    onClick={clickAttention}
                  >
                    {attentionTarget==="green"
                      ? "CLICK!"
                      : attentionTarget==="red"
                      ? "TOO SOON"
                      : "WAIT"
                    }
                  </button>

                  <div className="attention-status">
                    {attentionTarget==="green"
                      ? "Click now!"
                      : attentionTarget==="red"
                      ? "Next round..."
                      : "Stay ready..."
                    }
                  </div>

                  {reaction && (
                    <div className="reaction-badge">
                      Last reaction: <b>{reaction} ms</b>
                    </div>
                  )}
                </>
              )}

              {!attentionRunning && attentionScore!==null && (
                <>
                  <div className="success-icon">✓</div>

                  <h2>Attention Test Complete</h2>

                  <div className="score-number">
                    {attentionScore}%
                  </div>

                  <p>
                    Successful clicks: {attentionHits}<br/>
                    Early clicks: {attentionFalseClicks}
                  </p>

                  <button
                    className="primary"
                    onClick={resetAll}
                  >
                    Try Again
                  </button>
                </>
              )}
            </>
          )}

          {/* TASK SWITCHING */}

          {task==="Task Switching" && (
            <>
              {!switchRunning && switchResult===null && (
                <>
                  <div className="neuro-icon">🔄</div>

                  <h2>Task Switching</h2>

                  <p>
                    Your rule will change from round to round.
                    Read carefully before answering.
                  </p>

                  <button
                    className="primary"
                    onClick={startSwitching}
                  >
                    Start Task Switching
                  </button>
                </>
              )}

              {switchRunning && switchQuestion && (
                <>
                  <h2>
                    Round {switchRound} of {totalSwitchRounds}
                  </h2>

                  <p>{switchQuestion.rule}</p>

                  <div className="switch-value">
                    {switchQuestion.value}
                  </div>

                  <div className="switch-options">
                    {switchQuestion.options.map(option=>(
                      <button
                        key={option}
                        className="switch-option"
                        onClick={()=>answerSwitch(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="switch-score">
                    Correct: {switchScore}
                  </div>
                </>
              )}

              {!switchRunning && switchResult!==null && (
                <>
                  <div className="success-icon">✓</div>

                  <h2>Task Switching Complete</h2>

                  <div className="score-number">
                    {switchResult}%
                  </div>

                  <button
                    className="primary"
                    onClick={resetAll}
                  >
                    Try Again
                  </button>
                </>
              )}
            </>
          )}

        </div>

        {/* ================= INFO CARD ================= */}

        <div className="card neuro-info">

          <div className="brain2">🧠</div>

          <h2>
            Train • Observe • Reflect
          </h2>

          <p>
            NeuroNest lets you explore your own memory,
            attention and task-switching activity through
            short interactive exercises.
          </p>

          <div className="neuro-feature">
            <b>Memory</b>
            <span>Recall and recognition</span>
          </div>

          <div className="neuro-feature">
            <b>Attention</b>
            <span>Reaction and sustained attention</span>
          </div>

          <div className="neuro-feature">
            <b>Task Switching</b>
            <span>Changing rules and responses</span>
          </div>

          <div className="note">
            These activities are exploratory and are not
            medical or diagnostic tests.
          </div>

        </div>

      </div>
    </>
  );
}
function Focus(){
  const DEFAULT_MINUTES=25;

  const [task,setTask]=useState("");
  const [minutes,setMinutes]=useState(DEFAULT_MINUTES);
  const [sec,setSec]=useState(DEFAULT_MINUTES*60);

  const [run,setRun]=useState(false);
  const [sessionId,setSessionId]=useState(null);
  const [completed,setCompleted]=useState(false);

  // Countdown
  useEffect(()=>{
    if(!run) return;

    const timer=setInterval(()=>{
      setSec(current=>Math.max(current-1,0));
    },1000);

    return()=>clearInterval(timer);
  },[run]);

  // Automatically complete when timer reaches zero
  useEffect(()=>{
    if(sec!==0 || !run) return;

    setRun(false);
    setCompleted(true);

    if(sessionId){
      api.focus
        .complete(sessionId,minutes,true)
        .catch(()=>{});

      setSessionId(null);
    }
  },[sec,run,sessionId,minutes]);

  const chooseDuration=(value)=>{
    if(run || sessionId) return;

    setMinutes(value);
    setSec(value*60);
    setCompleted(false);
  };

  const handleCustomDuration=(value)=>{
    if(run || sessionId) return;

    const num=Number(value);

    if(!Number.isFinite(num)) return;

    const safe=Math.min(120,Math.max(5,num));

    setMinutes(safe);
    setSec(safe*60);
    setCompleted(false);
  };

  const startFocus=async()=>{

    // Resume existing session
    if(sessionId){
      setRun(current=>!current);
      return;
    }

    if(!task.trim()){
      alert("What would you like to focus on?");
      return;
    }

    try{
      const data=await api.focus.create(
        task.trim(),
        minutes
      );

      setSessionId(data.id);
      setCompleted(false);
      setSec(minutes*60);
      setRun(true);

    }catch(error){
      alert(error.message);
    }
  };

  const finishFocus=async()=>{

    setRun(false);

    if(sessionId){

      const elapsedSeconds=(minutes*60)-sec;
      const actualMinutes=Math.round(elapsedSeconds/60);

      try{
        await api.focus.complete(
          sessionId,
          actualMinutes,
          true
        );
      }catch{}

    }

    setSessionId(null);
    setSec(minutes*60);
    setCompleted(false);
  };

  const resetFocus=()=>{

    setRun(false);
    setSessionId(null);
    setSec(minutes*60);
    setCompleted(false);
  };

  const progress=Math.min(
    100,
    Math.round(
      (((minutes*60)-sec)/(minutes*60))*100
    )
  );

  const displayMinutes=String(
    Math.floor(sec/60)
  ).padStart(2,"0");

  const displaySeconds=String(
    sec%60
  ).padStart(2,"0");

  return(
    <>
      <Header
        title="Focus"
        sub="Choose one thing. Give it your full attention."
      />

      <div className="focus">

        <div className="focusbox">

          {!sessionId && !run && (
            <div className="focus-setup">

              <label>
                What do you want to focus on?
              </label>

              <input
                className="focus-task-input"
                value={task}
                onChange={e=>setTask(e.target.value)}
                placeholder="e.g. Study Python, read a book, code, revise..."
                disabled={run || !!sessionId}
              />

              <label className="duration-label">
                Session duration
              </label>

              <div className="duration-options">

                {[15,25,45,60].map(value=>(
                  <button
                    key={value}
                    className={
                      minutes===value
                        ? "duration-btn active"
                        : "duration-btn"
                    }
                    onClick={()=>chooseDuration(value)}
                  >
                    {value} min
                  </button>
                ))}

              </div>

              <div className="custom-duration">

                <span>Custom:</span>

                <input
                  type="number"
                  min="5"
                  max="120"
                  value={minutes}
                  onChange={e=>handleCustomDuration(e.target.value)}
                />

                <span>minutes</span>

              </div>

            </div>
          )}

          <div
            className="timer"
            style={{
              background:
                `radial-gradient(circle,#122d50 58%,transparent 59%),
                 conic-gradient(#65dbba 0 ${progress}%,
                 #354966 ${progress}% 100%)`
            }}
          >
            {displayMinutes}:{displaySeconds}
          </div>

          <div className="current-focus">

            {task.trim()
              ? task
              : "Choose something to focus on"}

          </div>

          {completed && (
            <div className="focus-complete">
              🎉 Focus session complete!
            </div>
          )}

          {!completed && (
            <div className="focus-progress">
              {progress}% completed
            </div>
          )}

          <div className="focus-actions">

            <button
              className="primary"
              onClick={startFocus}
            >
              {run
                ? "Pause"
                : sessionId
                ? "Resume"
                : completed
                ? "Start Again"
                : "Start Focus"}
            </button>

            <button
              className="secondary"
              onClick={finishFocus}
              disabled={!sessionId}
            >
              Finish
            </button>

            <button
              className="secondary"
              onClick={resetFocus}
            >
              Reset
            </button>

          </div>

        </div>

        <div className="card tip">

          <div>🌱</div>

          <h2>
            Focus on one thing at a time.
          </h2>

          <p>
            Decide what matters right now, remove one distraction,
            and give yourself a focused block of time.
          </p>

          <div className="focus-tips">

            <span>📱 Put your phone away</span>
            <span>🎧 Use Music Lab if it helps</span>
            <span>🧠 Keep one task in front of you</span>
            <span>🌿 Take a short break after the session</span>

          </div>

          <div className="note">
            Your focus session is saved to your private activity history.
          </div>

        </div>

      </div>
    </>
  );
}
function Music(){
  const tracks=[
    {title:"Deep Focus",file:"/audio/deep-focus.wav",category:"Focus",minutes:1,icon:"🌌"},
    {title:"Study Beats",file:"/audio/study-beats.wav",category:"Study",minutes:1,icon:"🎧"},
    {title:"Nature Sounds",file:"/audio/nature.wav",category:"Nature",minutes:1,icon:"🌿"},
    {title:"Lo-Fi Vibes",file:"/audio/lofi.wav",category:"Lo-Fi",minutes:1,icon:"🌅"},
    {title:"Piano Calm",file:"/audio/piano.wav",category:"Calm",minutes:1,icon:"🎹"},
    {title:"Ambient Space",file:"/audio/ambient.wav",category:"Ambient",minutes:1,icon:"✨"}
  ];

  const audioRef=useRef(null);
  const [playing,setPlaying]=useState(null);
  const [progress,setProgress]=useState(0);
  const [volume,setVolume]=useState(0.7);
  const [duration,setDuration]=useState(0);

  useEffect(()=>{
    const timer=setInterval(()=>{
      if(audioRef.current){
        setProgress(audioRef.current.currentTime||0);
        setDuration(audioRef.current.duration||0);
      }
    },250);

    return()=>clearInterval(timer);
  },[]);

  useEffect(()=>{
    return()=>{
      if(audioRef.current){
        audioRef.current.pause();
        audioRef.current=null;
      }
    };
  },[]);

  const formatTime=(value)=>{
    const total=Math.max(0,Math.floor(value||0));
    return `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
  };

  const togglePlay=async(index)=>{
    const track=tracks[index];

    try{
      if(playing===index && audioRef.current){
        audioRef.current.pause();
        setPlaying(null);
        return;
      }

      if(audioRef.current){
        audioRef.current.pause();
        audioRef.current.currentTime=0;
      }

      const audio=new Audio(track.file);
      audio.loop=true;
      audio.volume=volume;

      audio.addEventListener("ended",()=>{
        setPlaying(null);
        setProgress(0);
      });

      audio.addEventListener("loadedmetadata",()=>{
        setDuration(audio.duration||0);
      });

      audioRef.current=audio;
      setProgress(0);
      setPlaying(index);

      await audio.play();

      try{
        await api.music({
          track:track.title,
          category:track.category,
          minutes:track.minutes
        });
      }catch{}
    }catch{
      setPlaying(null);
      alert("This audio could not be played. Please refresh the page and try again.");
    }
  };

  const changeVolume=(value)=>{
    const next=Number(value);
    setVolume(next);

    if(audioRef.current){
      audioRef.current.volume=next;
    }
  };

  const activeTrack=playing!==null?tracks[playing]:null;

  return(
    <>
      <Header
        title="Music Lab"
        sub="Choose a sound environment for your session."
      />

      {activeTrack && (
        <div className="card now-playing">
          <div>
            <small>Now playing</small>
            <h2>{activeTrack.icon} {activeTrack.title}</h2>
            <div className="music-progress">
              <span
                style={{
                  width:duration ? `${Math.min(100,(progress/duration)*100)}%`:"0%"
                }}
              />
            </div>
            <small>
              {formatTime(progress)} / {formatTime(duration)}
            </small>
          </div>

          <div className="player-controls">
            <button
              className="play"
              onClick={()=>togglePlay(playing)}
            >
              ❚❚
            </button>

            <label className="volume-control">
              🔊
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e=>changeVolume(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      <div className="music">
        {tracks.map((t,i)=>(
          <div className="musiccard" key={t.title}>
            <div className={"art a"+i}>{t.icon}</div>

            <h3>{t.title}</h3>
            <p>{t.category} • looping ambient track</p>

            <button
              className="play"
              onClick={()=>togglePlay(i)}
            >
              {playing===i ? "❚❚" : "▶"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}


function Wellness(){
  const [mode,setMode]=useState("Breathing");
  const [run,setRun]=useState(false);
  const [sec,setSec]=useState(4);
  const [phase,setPhase]=useState("Breathe In");
  const [soundOn,setSoundOn]=useState(true);
  const [gratitude,setGratitude]=useState("");
  const omAudioRef=useRef(null);

  const stopOmSound=()=>{
    const audio=omAudioRef.current;

    if(audio){
      try{
        audio.pause();
        audio.currentTime=0;
      }catch{}
    }

    omAudioRef.current=null;
  };

  const startOmSound=async()=>{
    if(!soundOn) return;

    stopOmSound();

    try{
      const audio=new Audio("/audio/om.wav");
      audio.loop=true;
      audio.volume=0.65;
      omAudioRef.current=audio;
      await audio.play();
    }catch{}
  };

  useEffect(()=>{
    return()=>{
      stopOmSound();
    };
  },[]);

  useEffect(()=>{
    if(!run) return;

    const timer=setInterval(()=>{
      setSec(current=>{
        if(current<=1){
          if(mode==="Breathing"){
            setPhase(currentPhase=>
              currentPhase==="Breathe In"
                ? "Breathe Out"
                : "Breathe In"
            );
            return 4;
          }

          if(mode==="Silence"){
            setRun(false);
            return 0;
          }

          return 0;
        }

        return current-1;
      });
    },1000);

    return()=>clearInterval(timer);
  },[run,mode]);

  const changeMode=(newMode)=>{
    setRun(false);
    stopOmSound();

    setMode(newMode);

    if(newMode==="Breathing"){
      setSec(4);
      setPhase("Breathe In");
    }else if(newMode==="Silence"){
      setSec(120);
    }else{
      setSec(4);
    }
  };

  const toggleRun=()=>{
    if(run){
      setRun(false);

      if(mode==="Naam Jaap"){
        stopOmSound();
      }

      return;
    }

    if(mode==="Silence" && sec===0){
      setSec(120);
    }

    if(mode==="Breathing" && sec===0){
      setSec(4);
      setPhase("Breathe In");
    }

    setRun(true);

    if(mode==="Naam Jaap"){
      startOmSound();
    }
  };

  const toggleSound=()=>{
    const next=!soundOn;
    setSoundOn(next);

    if(next && run && mode==="Naam Jaap"){
      startOmSound();
    }else if(!next){
      stopOmSound();
    }
  };

  const saveSession=async()=>{
    setRun(false);
    stopOmSound();

    if(mode==="Gratitude" && gratitude.trim()){
      try{
        await api.journal.add(`Gratitude: ${gratitude.trim()}`);
        setGratitude("");
        alert("Your gratitude reflection was saved to your journal 🌿");
      }catch(e){
        alert(e.message);
      }
    }

    try{
      await api.wellness({
        mode,
        minutes:2
      });
    }catch{}
  };

  const minutes=Math.floor(sec/60);
  const seconds=sec%60;

  const timerText=
    mode==="Silence"
      ? `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`
      : `${sec} sec`;

  return(
    <>
      <Header
        title="Swaas & Jaap"
        sub="Breathe • Chant • Be Present."
      />

      <div className="tabs">
        {["Breathing","Naam Jaap","Silence","Gratitude"].map(x=>(
          <button
            key={x}
            className={mode===x?"active":""}
            onClick={()=>changeMode(x)}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="well">
        <div className="wellscene">

          {mode==="Breathing" && (
            <div
              className={`orb ${
                phase==="Breathe In"
                  ? "breathe-in"
                  : "breathe-out"
              }`}
            >
              <div className="breath-content">
                <span>{phase}</span>
                <b>{timerText}</b>
              </div>
            </div>
          )}

          {mode==="Naam Jaap" && (
            <>
              <div className="orb om-active">
                <div className="om-display">
                  <span>ॐ</span>
                </div>
              </div>

              <p className="om-subtitle">
                {run
                  ? "Listen • Breathe • Be Present"
                  : "A gentle OM sound for mindful practice"}
              </p>

              <button
                className="sound-toggle"
                onClick={toggleSound}
              >
                {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
              </button>
            </>
          )}

          {mode==="Silence" && (
            <div className="orb silence-orb">
              <div className="silence-display">
                <span>Silence</span>
                <b>{timerText}</b>
              </div>
            </div>
          )}

          {mode==="Gratitude" && (
            <div className="gratitude-box">
              <div className="gratitude-icon">🌿</div>

              <h2>One thing I'm grateful for...</h2>

              <textarea
                value={gratitude}
                onChange={e=>setGratitude(e.target.value)}
                placeholder="Write a few words..."
              />
            </div>
          )}

          <div className="well-buttons">
            <button
              className="primary"
              onClick={toggleRun}
              disabled={mode==="Gratitude"}
            >
              {run
                ? "Pause"
                : mode==="Breathing"
                ? "Begin Breathing"
                : "Begin"}
            </button>

            <button
              className="secondary"
              onClick={saveSession}
            >
              {mode==="Gratitude"
                ? "Save Reflection"
                : "Save Session"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2>
            {mode==="Breathing"
              ? "Guided Breathing"
              : mode==="Naam Jaap"
              ? "ॐ Naam Jaap"
              : mode==="Silence"
              ? "Quiet Space"
              : "Gratitude Reflection"}
          </h2>

          <p>
            {mode==="Breathing"
              ? "Follow the circle. Let it expand while you breathe in and contract while you breathe out."
              : mode==="Naam Jaap"
              ? "Use the gentle OM recording as an optional point of attention. Keep the volume comfortable."
              : mode==="Silence"
              ? "Take a quiet pause from screens and notifications. There is nothing you need to accomplish during this time."
              : "Write one small thing you genuinely appreciate today. Your reflection can be saved to your private journal."}
          </p>

          {mode==="Breathing" && (
            <div className="note">
              4 seconds inhale • 4 seconds exhale
            </div>
          )}

          {mode==="Naam Jaap" && (
            <div className="note">
              The OM recording is stored locally with the NeuroNest app.
            </div>
          )}

          {mode==="Silence" && (
            <div className="note">
              2-minute quiet practice
            </div>
          )}

          {mode==="Gratitude" && (
            <div className="note">
              Your reflection can be saved to your private journal.
            </div>
          )}

          <div className="note">
            Wellness activity, not medical treatment.
          </div>
        </div>
      </div>
    </>
  );
}

function Journal(){
  const [text,setText]=useState("");
  const [items,setItems]=useState([]);
  const [search,setSearch]=useState("");
  const [promptIndex,setPromptIndex]=useState(0);

  const prompts=[
    "What is on your mind right now?",
    "What went well for you today?",
    "What has been difficult lately?",
    "What is one thing you want to let go of?",
    "What are you looking forward to?",
    "What are you grateful for today?"
  ];

  useEffect(()=>{
    api.journal
      .list()
      .then(setItems)
      .catch(()=>{});

    const draft=localStorage.getItem("neuronest_journal_draft");

    if(draft){
      setText(draft);
    }
  },[]);

  useEffect(()=>{
    if(text.trim()){
      localStorage.setItem(
        "neuronest_journal_draft",
        text
      );
    }else{
      localStorage.removeItem(
        "neuronest_journal_draft"
      );
    }
  },[text]);

  const add=async()=>{
    const content=text.trim();

    if(!content){
      alert("Write something before saving your entry.");
      return;
    }

    try{
      const x=await api.journal.add(content);

      setItems(current=>[x,...current]);
      setText("");

      localStorage.removeItem(
        "neuronest_journal_draft"
      );

      alert("Your journal entry has been saved 🌿");

    }catch(e){
      alert(e.message);
    }
  };

  const deleteTemporary=(id)=>{
    const confirmed=window.confirm(
      "Remove this entry from the current view?"
    );

    if(!confirmed) return;

    setItems(current=>
      current.filter(item=>item.id!==id)
    );
  };

  const newEntry=()=>{
    setText("");
    localStorage.removeItem(
      "neuronest_journal_draft"
    );
  };

  const nextPrompt=()=>{
    setPromptIndex(
      current=>(current+1)%prompts.length
    );
  };

  const wordCount=text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const filteredItems=items.filter(item=>
    item.content
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return(
    <>
      <Header
        title="Journal"
        sub="Your thoughts. Your space. Private by account access."
      />

      <div className="journal-page">

        <div className="journal-writer card">

          <div className="journal-top">

            <div>
              <div className="private-label">
                🔒 PRIVATE JOURNAL
              </div>

              <h2>How are you feeling today?</h2>
            </div>

            <button
              className="prompt-btn"
              onClick={nextPrompt}
            >
              ✨ New Prompt
            </button>

          </div>

          <div className="journal-prompt">
            {prompts[promptIndex]}
          </div>

          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Start writing here..."
          />

          <div className="journal-toolbar">

            <div className="journal-count">
              {wordCount} words · {text.length} characters
            </div>

            <div className="journal-actions">

              <button
                className="secondary"
                onClick={newEntry}
                disabled={!text}
              >
                Clear
              </button>

              <button
                className="primary"
                onClick={add}
                disabled={!text.trim()}
              >
                Save Entry
              </button>

            </div>

          </div>

          <div className="journal-note">
            Your journal belongs to your account. Take your time,
            write honestly, and use this space for reflection.
          </div>

        </div>

        <div className="journal-history">

          <div className="history-header">

            <div>
              <h2>Recent Reflections</h2>
              <p>
                Revisit your thoughts and notice your own patterns.
              </p>
            </div>

            <div className="journal-total">
              {items.length} {items.length===1 ? "entry" : "entries"}
            </div>

          </div>

          <div className="journal-search">
            🔎
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search your entries..."
            />
          </div>

          {filteredItems.length ? (

            <div className="entries-list">

              {filteredItems.map(item=>(
                <article
                  className="entry-card"
                  key={item.id}
                >

                  <div className="entry-meta">

                    <div>
                      <span>
                        {new Date(
                          item.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            day:"numeric",
                            month:"short",
                            year:"numeric"
                          }
                        )}
                      </span>

                      <span>
                        {new Date(
                          item.created_at
                        ).toLocaleTimeString(
                          undefined,
                          {
                            hour:"numeric",
                            minute:"2-digit"
                          }
                        )}
                      </span>
                    </div>

                    <button
                      className="delete-entry"
                      onClick={()=>deleteTemporary(item.id)}
                      title="Temporarily remove this entry"
                    >
                      🗑 Delete
                    </button>

                  </div>

                  <p>{item.content}</p>

                </article>
              ))}

            </div>

          ) : (

            <div className="empty-journal card">

              <div className="empty-journal-icon">
                📖
              </div>

              <h3>
                {search
                  ? "No matching entries"
                  : "Your journal is waiting"}
              </h3>

              <p>
                {search
                  ? "Try a different search word."
                  : "Write your first reflection above. It can be as short or as detailed as you like."}
              </p>

            </div>

          )}

        </div>

      </div>
    </>
  );
}
function Chat(){
  const [msgs,setMsgs]=useState([
    {
      role:"assistant",
      content:"Hi, I'm NeuroSaathi 🌿 I'm here to listen. You don't need to have the perfect words — just start wherever feels easiest.",
      time:new Date()
    }
  ]);

  const [text,setText]=useState("");
  const [busy,setBusy]=useState(false);

  const quickPrompts=[
    "I'm feeling stressed",
    "I feel lonely",
    "I can't focus",
    "I have too much on my mind",
    "I just need to talk"
  ];

  const send=async(rawMessage)=>{
    const message=(rawMessage??text).trim();

    if(!message || busy) return;

    const userMessage={
      role:"user",
      content:message,
      time:new Date()
    };

    setText("");
    setMsgs(current=>[...current,userMessage]);
    setBusy(true);

    try{
      const data=await api.chat(message);

      setMsgs(current=>[
        ...current,
        {
          role:"assistant",
          content:data.reply,
          time:new Date()
        }
      ]);

    }catch(error){

      setMsgs(current=>[
        ...current,
        {
          role:"assistant",
          content:
            "I'm having trouble connecting right now. You can try again in a moment 🌿",
          time:new Date()
        }
      ]);

    }finally{
      setBusy(false);
    }
  };

  const clearConversation=()=>{
    const confirmed=window.confirm(
      "Start a new conversation on this screen?"
    );

    if(!confirmed) return;

    setMsgs([
      {
        role:"assistant",
        content:
          "Fresh start 🌿 I'm here. What's on your mind right now?",
        time:new Date()
      }
    ]);

    setText("");
  };

  const formatTime=(date)=>{
    return new Date(date).toLocaleTimeString(
      undefined,
      {
        hour:"numeric",
        minute:"2-digit"
      }
    );
  };

  const userMessageCount=msgs.filter(
    m=>m.role==="user"
  ).length;

  return(
    <>
      <Header
        title="NeuroSaathi"
        sub="A supportive space to talk, reflect, and take one small next step."
      />

      <div className="chat-page">

        {/* CHAT AREA */}

        <div className="chatbox">

          <div className="chat-header">

            <div className="chat-person">

              <div className="chat-avatar">
                🌿
              </div>

              <div>
                <strong>NeuroSaathi</strong>

                <span className="online-status">
                  ● Here to listen
                </span>
              </div>

            </div>

            <button
              className="clear-chat"
              onClick={clearConversation}
            >
              ↻ New chat
            </button>

          </div>

          <div className="messages">

            {msgs.map((message,index)=>(
              <div
                key={index}
                className={
                  "message-row "+
                  message.role
                }
              >

                {message.role==="assistant" && (
                  <div className="message-avatar">
                    🌿
                  </div>
                )}

                <div className="message-content">

                  <div
                    className={
                      "msg "+message.role
                    }
                  >
                    {message.content}
                  </div>

                  <span className="message-time">
                    {formatTime(message.time)}
                  </span>

                </div>

              </div>
            ))}

            {busy && (
              <div className="message-row assistant">

                <div className="message-avatar">
                  🌿
                </div>

                <div className="message-content">

                  <div className="msg assistant typing-bubble">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                  <span className="message-time">
                    NeuroSaathi is thinking...
                  </span>

                </div>

              </div>
            )}

          </div>

          {/* QUICK PROMPTS */}

          <div className="quick-area">

            <div className="quick-title">
              You could start with...
            </div>

            <div className="quick">

              {quickPrompts.map(prompt=>(
                <button
                  key={prompt}
                  onClick={()=>send(prompt)}
                  disabled={busy}
                >
                  {prompt}
                </button>
              ))}

            </div>

          </div>

          {/* INPUT */}

          <div className="chatinput">

            <input
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{
                if(e.key==="Enter" && !e.shiftKey){
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Share what's on your mind..."
              disabled={busy}
            />

            <button
              onClick={()=>send()}
              disabled={!text.trim() || busy}
              aria-label="Send message"
            >
              {busy ? "..." : "➤"}
            </button>

          </div>

          <div className="chat-footer">
            {userMessageCount===0
              ? "This is your private conversation space."
              : `${userMessageCount} message${userMessageCount===1?"":"s"} shared in this conversation.`}
          </div>

        </div>

        {/* SIDE INFORMATION */}

        <div className="chat-side">

          <div className="card chat-welcome">

            <div className="chatart">
              🌿
            </div>

            <h2>
              You don't have to figure everything out at once.
            </h2>

            <p>
              NeuroSaathi is designed for supportive reflection.
              You can talk about everyday stress, loneliness,
              focus difficulties, studies, overthinking, or simply
              whatever is on your mind.
            </p>

          </div>

          <div className="card support-card">

            <div className="support-icon">
              💚
            </div>

            <h3>
              A small reminder
            </h3>

            <p>
              Talking here can be helpful, but NeuroSaathi is not
              a replacement for trusted people or qualified
              mental-health professionals.
            </p>

          </div>

          <div className="card chat-tips">

            <h3>
              Gentle ways to reset
            </h3>

            <div className="chat-tip">
              <span>🌬️</span>
              <p>Take a few comfortable breaths.</p>
            </div>

            <div className="chat-tip">
              <span>📝</span>
              <p>Write down what is taking up your mind.</p>
            </div>

            <div className="chat-tip">
              <span>🚶</span>
              <p>Take a short screen break.</p>
            </div>

            <div className="chat-tip">
              <span>🤝</span>
              <p>Reach out to someone you trust.</p>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
function Analytics(){
  const [a,setA]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    api.analytics()
      .then(setA)
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const weekly=a?.weekly || [];

  const maxMinutes=Math.max(
    ...weekly.map(day=>day.total_minutes),
    1
  );

  return(
    <>
      <Header
        title="Your Progress"
        sub="Track your own journey — no public rankings or comparisons."
      />

      {/* SUMMARY */}

      <div className="stats analytics-stats">

        <div className="stat analytics-stat">
          <span className="analytics-stat-icon">◷</span>
          <b>
            {a?.focus_minutes ?? 0} min
          </b>
          <small>Focus Time</small>
        </div>

        <div className="stat analytics-stat">
          <span className="analytics-stat-icon">🧠</span>
          <b>
            {a?.memory_accuracy ?? 0}%
          </b>
          <small>Memory Accuracy</small>
        </div>

        <div className="stat analytics-stat">
          <span className="analytics-stat-icon">▤</span>
          <b>
            {a?.journal_entries ?? 0}
          </b>
          <small>Journal Entries</small>
        </div>

        <div className="stat analytics-stat">
          <span className="analytics-stat-icon">◌</span>
          <b>
            {a?.wellness_minutes ?? 0} min
          </b>
          <small>Wellness Time</small>
        </div>

      </div>

      {/* WEEKLY ACTIVITY */}

      <div className="card analytics-chart">

        <div className="analytics-chart-header">

          <div>
            <h2>Weekly Activity</h2>

            <p>
              Your combined focus, music and wellness activity.
            </p>
          </div>

          <div className="analytics-badge">
            Last 7 days
          </div>

        </div>

        {loading ? (

          <div className="analytics-loading">
            Loading your activity...
          </div>

        ) : (

          <div className="weekly-chart">

            {weekly.map(day=>{

              const height=
                day.total_minutes===0
                  ? 5
                  : Math.max(
                      8,
                      Math.round(
                        (day.total_minutes/maxMinutes)*100
                      )
                    );

              return(
                <div
                  className="chart-column"
                  key={day.date}
                >

                  <div className="chart-value">
                    {day.total_minutes > 0
                      ? `${day.total_minutes}m`
                      : ""}
                  </div>

                  <div className="chart-track">

                    <div
                      className="chart-bar"
                      style={{
                        height:`${height}%`
                      }}
                    />

                  </div>

                  <div className="chart-day">
                    {day.day}
                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* ACTIVITY BREAKDOWN */}

      <div className="analytics-grid">

        <div className="card">

          <h2>Activity Breakdown</h2>

          <p>
            See how your recorded time is distributed.
          </p>

          <div className="breakdown-list">

            <div className="breakdown-row">
              <span>◷ Focus</span>
              <b>{a?.focus_minutes ?? 0} min</b>
            </div>

            <div className="breakdown-row">
              <span>♫ Music</span>
              <b>{a?.music_minutes ?? 0} min</b>
            </div>

            <div className="breakdown-row">
              <span>◌ Wellness</span>
              <b>{a?.wellness_minutes ?? 0} min</b>
            </div>

            <div className="breakdown-row">
              <span>▤ Journal</span>
              <b>{a?.journal_entries ?? 0}</b>
            </div>

          </div>

        </div>

        {/* RECENT */}

        <div className="card">

          <div className="recent-header">

            <div>
              <h2>Recent Activity</h2>
              <p>Your latest NeuroNest sessions.</p>
            </div>

          </div>

          {a?.recent_activity?.length ? (

            <div className="recent-list">

              {a.recent_activity.map((item,index)=>(
                <div
                  className="recent-item"
                  key={`${item.type}-${item.created_at}-${index}`}
                >

                  <div className="recent-icon">
                    {item.icon}
                  </div>

                  <div className="recent-content">

                    <strong>{item.title}</strong>

                    <span>
                      {item.detail}
                    </span>

                  </div>

                  <small>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            day:"numeric",
                            month:"short"
                          }
                        )
                      : ""}
                  </small>

                </div>
              ))}

            </div>

          ) : (

            <div className="analytics-empty">
              <div>🌱</div>

              <h3>No activity yet</h3>

              <p>
                Try a Focus session, NeuroLab activity,
                journal entry, or wellness practice.
              </p>
            </div>

          )}

        </div>

      </div>

      {/* PERSONAL NOTE */}

      <div className="card analytics-note-card">

        <div className="analytics-note-icon">
          🌿
        </div>

        <div>
          <h3>Your progress is personal.</h3>

          <p>
            NeuroNest is designed to help you observe
            your own habits over time, not compare yourself
            with other people.
          </p>
        </div>

      </div>
    </>
  );
}
function Settings({user,setPage}){
  const [notifications,setNotifications]=useState(
    localStorage.getItem("neuronest_notifications")!=="off"
  );

  const [sound,setSound]=useState(
    localStorage.getItem("neuronest_sound")!=="off"
  );

  const [saved,setSaved]=useState(false);

  const toggleNotifications=(value)=>{
    setNotifications(value);

    localStorage.setItem(
      "neuronest_notifications",
      value ? "on" : "off"
    );
  };

  const toggleSound=(value)=>{
    setSound(value);

    localStorage.setItem(
      "neuronest_sound",
      value ? "on" : "off"
    );
  };

  const saveSettings=()=>{
    setSaved(true);

    setTimeout(()=>{
      setSaved(false);
    },2000);
  };

  return(
    <>
      <Header
        title="Settings"
        sub="Personalize your NeuroNest experience."
      />

      <div className="settings-page">

        <div className="card settings-profile">

          <div className="settings-avatar">
            {user?.name?.[0]?.toUpperCase() || "M"}
          </div>

          <div>
            <small>YOUR PROFILE</small>

            <h2>
              {user?.name || "NeuroNest User"}
            </h2>

            <p>
              {user?.email || "Your account email"}
            </p>
          </div>

        </div>

        <div className="settings-grid">

          <div className="card">

            <div className="settings-heading">
              <span>⚙️</span>

              <div>
                <h2>Preferences</h2>
                <p>Choose how NeuroNest behaves for you.</p>
              </div>
            </div>

            <div className="setting-row">

              <div>
                <strong>Notifications</strong>
                <small>
                  Allow helpful reminders and updates.
                </small>
              </div>

              <button
                className={
                  notifications ? "toggle on" : "toggle"
                }
                onClick={()=>toggleNotifications(!notifications)}
              >
                <span></span>
              </button>

            </div>

            <div className="setting-row">

              <div>
                <strong>Sound</strong>
                <small>
                  Enable audio experiences in NeuroNest.
                </small>
              </div>

              <button
                className={
                  sound ? "toggle on" : "toggle"
                }
                onClick={()=>toggleSound(!sound)}
              >
                <span></span>
              </button>

            </div>

          </div>

          <div className="card">

            <div className="settings-heading">
              <span>🌿</span>

              <div>
                <h2>Wellness & Privacy</h2>
                <p>How NeuroNest is intended to be used.</p>
              </div>
            </div>

            <div className="settings-info">
              <div>🔒</div>

              <p>
                Your activities are associated with your account.
                NeuroNest is designed for personal reflection,
                habit observation, focus support, and wellness.
              </p>
            </div>

            <div className="settings-info">
              <div>🧠</div>

              <p>
                NeuroLab activities are exploratory and are not
                medical or diagnostic tests.
              </p>
            </div>

            <div className="settings-info">
              <div>💬</div>

              <p>
                NeuroSaathi provides supportive reflection and
                is not a replacement for trusted people or
                qualified professionals.
              </p>
            </div>

          </div>

        </div>

        <div className="card settings-about">

          <div>
            <h2>About NeuroNest</h2>

            <p>
              A calm digital space for focus, reflection,
              cognitive exploration, music, and mindful
              wellness practices.
            </p>
          </div>

          <div className="version">
            NeuroNest
            <span>Version 1.0.0</span>
          </div>

        </div>

        <div className="settings-actions">

          <button
            className="secondary"
            onClick={()=>setPage("Home")}
          >
            ← Back to Home
          </button>

          <button
            className="primary"
            onClick={saveSettings}
          >
            {saved ? "✓ Saved" : "Save Preferences"}
          </button>

        </div>

      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App/>);
