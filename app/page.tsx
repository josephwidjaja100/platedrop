"use client"

import React, { useState } from 'react';
import { signIn } from "next-auth/react";

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [signupState, setSignupState] = useState({
    emailPrefix: '',
    password: '',
    confirmPassword: '',
    otp: '',
    flow: 'email-signup',
    isLoading: false,
    error: '',
    success: ''
  });
  const [loginState, setLoginState] = useState({
    emailPrefix: '',
    password: '',
    isLoading: false,
    error: '',
    success: ''
  });

  const bubbles = [
    { id: 0, left: '5%', top: '10%', delay: '0s' },
    { id: 1, left: '30%', top: '20%', delay: '0.3s' },
    { id: 2, left: '10%', top: '65%', delay: '0.6s' },
    { id: 3, left: '35%', top: '77%', delay: '0.9s' },
    { id: 4, left: '10%', top: '50%', delay: '1.2s' },
    { id: 5, left: '70%', top: '70%', delay: '1.5s' },
    { id: 6, left: '80%', top: '15%', delay: '1.8s' },
    { id: 7, left: '75%', top: '40%', delay: '2.1s' },
  ];

  const messageTexts = [
    "my date drop actually has nothing in common with me. please help.",
    "im in a relationship im experiencing severe fomo.",
    "i just wanna meet people not date them instantly",
    "she wouldnt stop talking about her cat tf.",
    "my date drop ghosted me.",
    "he just kept talking about formula 1 i wanted to die.",
    "he literally talked about his ex the entire time.",
    "i have a boyfriend but i want to meet people",
  ];

  const handleGetMatched = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
    setAuthMode('signup');
    setSignupState({
      emailPrefix: '',
      password: '',
      confirmPassword: '',
      otp: '',
      flow: 'email-signup',
      isLoading: false,
      error: '',
      success: ''
    });
    setLoginState({
      emailPrefix: '',
      password: '',
      isLoading: false,
      error: '',
      success: ''
    });
  };

  const getFullEmail = (prefix: string) => {
    return `${prefix}@stanford.edu`;
  };

  // SIGNUP HANDLERS
  const handleSendOTP = async () => {
    if (!signupState.emailPrefix || !signupState.password || !signupState.confirmPassword) {
      setSignupState(prev => ({
        ...prev,
        error: 'please fill in all fields.'
      }));
      return;
    }

    if (signupState.password.length < 8) {
      setSignupState(prev => ({
        ...prev,
        error: 'password must be at least 8 characters long.'
      }));
      return;
    }

    if (signupState.password !== signupState.confirmPassword) {
      setSignupState(prev => ({
        ...prev,
        error: 'passwords do not match.'
      }));
      return;
    }

    const fullEmail = getFullEmail(signupState.emailPrefix);

    setSignupState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: ''
    }));

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fullEmail,
          password: signupState.password,
          type: "signup"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSignupState(prev => ({
          ...prev,
          flow: 'otp-verification',
          success: data.message,
          isLoading: false
        }));
      } else {
        if (data.hasGoogleAccount) {
          setSignupState(prev => ({
            ...prev,
            error: 'this email is already registered with google. please sign in with google instead.',
            isLoading: false
          }));
        } else {
          setSignupState(prev => ({
            ...prev,
            error: data.message,
            isLoading: false
          }));
        }
      }
    } catch (error) {
      setSignupState(prev => ({
        ...prev,
        error: 'network error. please try again.',
        isLoading: false
      }));
    }
  };

  const handleVerifyOTP = async () => {
    if (!signupState.otp || signupState.otp.length !== 6) {
      setSignupState(prev => ({
        ...prev,
        error: 'please enter a valid 6-digit code.'
      }));
      return;
    }

    const fullEmail = getFullEmail(signupState.emailPrefix);

    setSignupState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: ''
    }));

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fullEmail,
          otp: signupState.otp,
          type: "signup",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSignupState(prev => ({
          ...prev,
          success: data.message,
          isLoading: false
        }));

        if (data.shouldSignIn) {
          setTimeout(async () => {
            await signIn("credentials", {
              email: fullEmail,
              password: signupState.password,
              redirect: false,
            });
          }, 1500);

          setTimeout(() => {
            window.location.href = '/profile';
          }, 1000);
        }
      } else {
        setSignupState(prev => ({
          ...prev,
          error: data.message,
          isLoading: false
        }));
      }
    } catch (error) {
      setSignupState(prev => ({
        ...prev,
        error: 'network error. please try again.',
        isLoading: false
      }));
    }
  };

  const handleResendOTP = async () => {
    const fullEmail = getFullEmail(signupState.emailPrefix);

    setSignupState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: ''
    }));

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fullEmail,
          password: signupState.password,
          type: "signup"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSignupState(prev => ({
          ...prev,
          success: 'new verification code sent!',
          isLoading: false
        }));
      } else {
        setSignupState(prev => ({
          ...prev,
          error: data.message,
          isLoading: false
        }));
      }
    } catch (error) {
      setSignupState(prev => ({
        ...prev,
        error: 'failed to resend code. please try again.',
        isLoading: false
      }));
    }
  };

  // LOGIN HANDLER
  const handleLogin = async () => {
    if (!loginState.emailPrefix || !loginState.password) {
      setLoginState(prev => ({
        ...prev,
        error: 'please fill in all fields.'
      }));
      return;
    }

    const fullEmail = getFullEmail(loginState.emailPrefix);
    const password = loginState.password;

    setLoginState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: ''
    }));

    try {
      const result = await signIn("credentials", {
        email: fullEmail,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setLoginState(prev => ({
          ...prev,
          error: 'invalid credentials. please try again.',
          isLoading: false
        }));
      } else if (result?.ok) {
        setLoginState(prev => ({
          ...prev,
          success: 'login successful! redirecting...',
          isLoading: false
        }));

        setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
      }
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        error: 'network error. please try again.',
        isLoading: false
      }));
    }
  };

  const renderSignupForm = () => {
    if (signupState.flow === 'email-signup') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="sunetid"
              value={signupState.emailPrefix}
              onChange={(e) =>
                setSignupState(prev => ({
                  ...prev,
                  emailPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                  error: ''
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900 pr-32"
              disabled={signupState.isLoading}
              style={{ fontFamily: 'Merriweather, serif' }}
            />
            <span 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              @stanford.edu
            </span>
          </div>

          <input
            type="password"
            placeholder="password (min. 8 characters)"
            value={signupState.password}
            onChange={(e) =>
              setSignupState(prev => ({
                ...prev,
                password: e.target.value,
                error: ''
              }))
            }
            className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900"
            disabled={signupState.isLoading}
            style={{ fontFamily: 'Merriweather, serif' }}
          />

          <input
            type="password"
            placeholder="confirm password"
            value={signupState.confirmPassword}
            onChange={(e) =>
              setSignupState(prev => ({
                ...prev,
                confirmPassword: e.target.value,
                error: ''
              }))
            }
            className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900"
            disabled={signupState.isLoading}
            style={{ fontFamily: 'Merriweather, serif' }}
          />

          <button
            onClick={handleSendOTP}
            disabled={
              signupState.isLoading ||
              !signupState.emailPrefix ||
              !signupState.password ||
              !signupState.confirmPassword ||
              signupState.password.length < 8
            }
            className="w-full px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            {signupState.isLoading ? 'sending...' : 'send verification code'}
          </button>
        </div>
      );
    }

    if (signupState.flow === 'otp-verification') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Merriweather, serif' }}>
              we sent a 6-digit code to <strong>{getFullEmail(signupState.emailPrefix)}</strong>
            </p>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={signupState.otp[index] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.match(/^[0-9]$/)) {
                    const newOtp = signupState.otp.split('');
                    newOtp[index] = value;
                    setSignupState(prev => ({
                      ...prev,
                      otp: newOtp.join(''),
                      error: ''
                    }));
                    if (index < 5) {
                      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                      if (nextInput) nextInput.focus();
                    }
                  } 
                  // else if (value === '') {
                  //   // Handle backspace - clear current position
                  //   const newOtp = signupState.otp.split('');
                  //   newOtp[index] = '';
                  //   setSignupState(prev => ({
                  //     ...prev,
                  //     otp: newOtp.join(''),
                  //     error: ''
                  //   }));
                  // }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace') {
                    if (signupState.otp[index]) {
                      e.preventDefault();
                      const newOtp = signupState.otp.split('');
                      newOtp[index] = '';
                      setSignupState(prev => ({
                        ...prev,
                        otp: newOtp.join(''),
                        error: ''
                      }));
                    } 
                    if (index > 0) {
                      // If current field is empty, move to previous field
                      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                      if (prevInput) {
                        prevInput.focus();
                      }
                    }
                  }
                  if (e.key === 'ArrowLeft') {
                    if (index > 0) {
                      // If current field is empty, move to previous field
                      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                      if (prevInput) {
                        prevInput.focus();
                      }
                    }
                  }
                  if (e.key === 'ArrowRight') {
                    if (index < 5) {
                      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                      if (nextInput) {
                        nextInput.focus();
                      }
                    }
                  }
                }}
                data-index={index}
                className="w-12 h-14 text-center text-2xl border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900"
                disabled={signupState.isLoading}
                style={{ fontFamily: 'Merriweather, serif' }}
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={signupState.isLoading || signupState.otp.length !== 6}
            className="w-full px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            {signupState.isLoading ? 'creating account...' : 'create account'}
          </button>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleResendOTP}
              disabled={signupState.isLoading}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              didn't receive code? resend
            </button>
            <button
              onClick={() =>
                setSignupState(prev => ({
                  ...prev,
                  flow: 'email-signup',
                  otp: '',
                  error: '',
                  success: ''
                }))
              }
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              ← back
            </button>
          </div>
        </div>
      );
    }
  };

  const renderLoginForm = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="sunetid"
            value={loginState.emailPrefix}
            onChange={(e) =>
              setLoginState(prev => ({
                ...prev,
                emailPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                error: ''
              }))
            }
            className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900 pr-32"
            disabled={loginState.isLoading}
            style={{ fontFamily: 'Merriweather, serif' }}
          />
          <span 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            @stanford.edu
          </span>
        </div>

        <input
          type="password"
          placeholder="password"
          value={loginState.password}
          onChange={(e) =>
            setLoginState(prev => ({
              ...prev,
              password: e.target.value,
              error: ''
            }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && loginState.emailPrefix && loginState.password) {
              handleLogin();
            }
          }}
          className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-gray-900"
          disabled={loginState.isLoading}
          style={{ fontFamily: 'Merriweather, serif' }}
        />

        <button
          onClick={handleLogin}
          disabled={
            loginState.isLoading ||
            !loginState.emailPrefix ||
            !loginState.password
          }
          className="w-full px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Merriweather, serif' }}
        >
          {loginState.isLoading ? 'logging in...' : 'log in'}
        </button>
      </div>
    );
  };

  return (
    <>
      <link 
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="relative w-full h-screen overflow-hidden bg-gradient-animated" style={{ paddingTop: 'max(0px, env(safe-area-inset-top))', paddingBottom: 'max(0px, env(safe-area-inset-bottom))', paddingLeft: 'max(0px, env(safe-area-inset-left))', paddingRight: 'max(0px, env(safe-area-inset-right))', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        {bubbles.map((bubble, i) => {
          const messageIndex = i % messageTexts.length;
          
          return (
            <div
              key={bubble.id}
              className={`absolute animate-float ${i >= 4 ? 'hidden md:block' : ''}`}
              style={{
                left: bubble.left,
                top: bubble.top,
                animationDelay: bubble.delay,
                animationDuration: '4s',
                fontFamily: 'Merriweather, serif',
                maxWidth: '250px',
                filter: showAuth ? 'blur(8px)' : 'none',
                transition: 'filter 0.3s ease',
                width: '250px'
              }}
            >
              <div className="relative backdrop-blur-md bg-white/20 shadow-lg p-4" style={{ borderRadius: '24px 24px 24px 0' }}>
                <p className="text-gray-600 text-xs opacity-70 font-medium">
                  {messageTexts[messageIndex]}
                </p>
              </div>
            </div>
          );
        })}

        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            filter: showAuth ? 'blur(8px)' : 'none',
            transition: 'filter 0.3s ease',
            paddingTop: 'max(0px, env(safe-area-inset-top))',
            paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(0px, env(safe-area-inset-left))',
            paddingRight: 'max(0px, env(safe-area-inset-right))'
          }}
        >
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-800 tracking-tight whitespace-nowrap"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            plate drop
          </h1>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-6 max-w-4xl text-center px-4"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            meet people who actually share your interests. <br /> no pressure, no awkward dates—just real connection.
          </p>
          
          <button
            onClick={handleGetMatched}
            className="mt-8 px-8 py-4 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            get matched
          </button>
        </div>

        {showAuth && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={handleCloseAuth}
            ></div>
            
            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl border-2 border-gray-300 shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleCloseAuth}
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>

              <div className="flex mb-6 bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-md font-bold transition-all duration-300 ${
                    authMode === 'signup'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ fontFamily: 'Merriweather, serif' }}
                >
                  sign up
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-md font-bold transition-all duration-300 ${
                    authMode === 'login'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ fontFamily: 'Merriweather, serif' }}
                >
                  log in
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 
                  className="text-3xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: 'Merriweather, serif' }}
                >
                  {authMode === 'signup' ? 'start connecting' : 'welcome back'}
                </h2>
                <p 
                  className="text-gray-600"
                  style={{ fontFamily: 'Merriweather, serif' }}
                >
                  {authMode === 'signup' 
                    ? 'create your account to get matched' 
                    : 'log in to continue your journey'}
                </p>
              </div>

              {authMode === 'signup' && signupState.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                  {signupState.error}
                </div>
              )}
              {authMode === 'signup' && signupState.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                  {signupState.success}
                </div>
              )}
              {authMode === 'login' && loginState.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                  {loginState.error}
                </div>
              )}
              {authMode === 'login' && loginState.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                  {loginState.success}
                </div>
              )}

              {authMode === 'signup' ? renderSignupForm() : renderLoginForm()}
            </div>
          </div>
        )}

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          .bg-gradient-animated {
            background: linear-gradient(135deg, #dbeafe, #e9d5ff, #fae8ff, #ddd6fe, #bfdbfe);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default Home;