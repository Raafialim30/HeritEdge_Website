import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Quiz.module.css';
import { 
  BsLightningCharge, 
  BsClock, 
  BsJournalText, 
  BsPlayCircle, 
  BsArrowLeft, 
  BsTrophy,
  BsCheckCircle,
  BsXCircle
} from 'react-icons/bs';

const TIME_LIMIT_PER_QUESTION = 10;

const Quiz = () => {
  const navigate = useNavigate();
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // Menyimpan histori jawaban
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false); // Toggle fitur review
  const [isStarted, setIsStarted] = useState(false);
  const [timer, setTimer] = useState(TIME_LIMIT_PER_QUESTION);
  const [loading, setLoading] = useState(true);

  // --- LOGIKA MENGAMBIL DATA & PEMBATASAN 30 SOAL ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/quiz');
        
        if (response.data && response.data.length > 0) {
          const shuffled = [...response.data].sort(() => 0.5 - Math.random());
          const limitedQuestions = shuffled.slice(0, 30);

          const formattedQuestions = limitedQuestions.map((item) => ({
            ...item,
            options: [item.option_a, item.option_b, item.option_c, item.option_d]
          }));
          
          setQuizQuestions(formattedQuestions);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // --- LOGIKA TIMER ---
  useEffect(() => {
    if (!isStarted || showResults || loading || quizQuestions.length === 0) return;
    
    if (timer === 0) {
      handleNextQuestion();
      return;
    }
    
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timer, isStarted, showResults, loading, quizQuestions.length]);

  const handleStartQuiz = () => {
    if (quizQuestions.length > 0) {
      setIsStarted(true);
      setTimer(TIME_LIMIT_PER_QUESTION);
    } else {
      alert("Soal belum tersedia di database.");
    }
  };

  const handleAnswerSelect = (option) => setSelectedAnswer(option);

  const handleNextQuestion = () => {
    const currentQ = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ?.correct_answer;

    // Simpan riwayat jawaban untuk direview nanti
    setUserAnswers([...userAnswers, {
      question: currentQ.question,
      selected: selectedAnswer || "Waktu Habis",
      correct: currentQ.correct_answer,
      isCorrect: isCorrect
    }]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimer(TIME_LIMIT_PER_QUESTION);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader}></div>
        <p>Menyiapkan Soal Budaya...</p>
      </div>
    );
  }

  const QuizHeader = () => (
    <nav className={styles.minimalHeader}>
      <div className={styles.brandContainer}>
        <div className={styles.brandIcon}>H</div>
        <span className={styles.brandName}>HeritEdge</span>
      </div>
      {!showResults && (
        <button className={styles.exitBtn} onClick={() => navigate('/')}>
          <BsArrowLeft /> <span>Keluar</span>
        </button>
      )}
    </nav>
  );

  // --- 1. START SCREEN ---
  if (!isStarted) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.glassCard}>
          <div className={styles.welcomeIcon}><BsLightningCharge /></div>
          <h1 className={styles.mainTitle}>Uji Pengetahuan Budaya</h1>
          <p className={styles.subTitle}>Selesaikan kuis 30 soal untuk menguji wawasanmu.</p>
          <div className={styles.infoGrid}>
            <div className={styles.infoBox}><BsJournalText /> <strong>{quizQuestions.length}</strong> Soal</div>
            <div className={styles.infoBox}><BsClock /> <strong>{TIME_LIMIT_PER_QUESTION}s</strong> / Soal</div>
          </div>
          <button onClick={handleStartQuiz} className={styles.glowBtn}>Mulai Sekarang</button>
          <Link to="/" className={styles.textLink}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  // --- 2. RESULT & REVIEW SCREEN ---
  if (showResults) {
    const finalScore = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className={styles.mainWrapper}>
        <QuizHeader />
        <div className={styles.glassCard}>
          {!showReview ? (
            <>
              <div className={styles.trophyIcon}><BsTrophy /></div>
              <h2 className={styles.resultTitle}>Hasil Akhir</h2>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreVal}>{finalScore}</span>
                <small>Score</small>
              </div>
              <p className={styles.resultSummary}>Terjawab benar <strong>{score}</strong> dari <strong>{quizQuestions.length}</strong> soal.</p>
              <div className={styles.btnGroup}>
                <button onClick={() => setShowReview(true)} className={styles.outlineBtn}>Review Jawaban</button>
                <button onClick={() => window.location.reload()} className={styles.glowBtn}>Main Lagi</button>
              </div>
            </>
          ) : (
            <div className={styles.reviewSection}>
              <h2 className={styles.reviewTitle}>Review Jawaban</h2>
              <div className={styles.reviewList}>
                {userAnswers.map((ans, index) => (
                  <div key={index} className={`${styles.reviewCard} ${ans.isCorrect ? styles.correct : styles.wrong}`}>
                    <p className={styles.reviewQuestion}><strong>{index + 1}.</strong> {ans.question}</p>
                    <div className={styles.reviewDetail}>
                      <span className={styles.yourAns}>Pilihan Anda: {ans.selected} {ans.isCorrect ? <BsCheckCircle color="green"/> : <BsXCircle color="red"/>}</span>
                      {!ans.isCorrect && <span className={styles.correctAns}>Kunci Jawaban: {ans.correct}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowReview(false)} className={styles.actionBtn}>Kembali ke Skor</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. ACTIVE QUIZ ---
  const currentQuestion = quizQuestions[currentQuestionIndex];
  return (
    <div className={styles.mainWrapper}>
      <QuizHeader />
      <div className={styles.quizContainer}>
        <div className={styles.modernQuizCard}>
          <div className={styles.cardHeader}>
            <div className={styles.timerBox}>
              <BsClock className={timer <= 3 ? styles.timerWarning : ''} />
              <span className={timer <= 3 ? styles.timerWarning : ''}>{timer}s</span>
            </div>
            <div className={styles.progressCounter}>Soal {currentQuestionIndex + 1} / {quizQuestions.length}</div>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressLine} style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
          </div>
          <h2 className={styles.questionHeading}>{currentQuestion?.question}</h2>
          <div className={styles.optionsStack}>
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                className={`${styles.optionRow} ${selectedAnswer === option ? styles.optionActive : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className={styles.optionBadge}>{String.fromCharCode(65 + idx)}</div>
                <span className={styles.optionLabel}>{option}</span>
              </button>
            ))}
          </div>
          <button className={styles.actionBtn} onClick={handleNextQuestion} disabled={!selectedAnswer}>
            {currentQuestionIndex + 1 === quizQuestions.length ? 'Lihat Hasil' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;