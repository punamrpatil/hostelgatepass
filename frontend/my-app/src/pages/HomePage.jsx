import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { 
  Shield, QrCode, Users, Clock, CheckCircle, ArrowRight, 
  Zap, Sparkles, Layers, Fingerprint, Globe, Cpu, 
  Award, ThumbsUp, Coffee, ChevronLeft, ChevronRight,
  Star, MessageCircle, Bell, Activity, Lock
} from 'lucide-react';

// ==================== ANIMATION VARIANTS ====================
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// ==================== ENHANCED FEATURE CARD ====================
const FeatureCard = ({ icon: Icon, title, description, delay, index, gradient }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeUp}
      transition={{ delay: delay || index * 0.1 }}
      whileHover={{ 
        y: -15, 
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 300 }
      }}
      className="relative p-6 transition-all duration-300 border group bg-white/5 backdrop-blur-sm rounded-2xl border-white/10 hover:border-brand-500/60 hover:shadow-2xl hover:shadow-brand-500/20"
    >
      {/* Animated gradient border on hover */}
      <motion.div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500/0 via-brand-500/20 to-brand-500/0 opacity-0 group-hover:opacity-100"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{ pointerEvents: 'none' }}
      />
      
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-br from-brand-500/5 to-purple-500/5 group-hover:opacity-100" />
      
      <div className="relative z-10">
        <motion.div 
          className="flex items-center justify-center mb-5 w-14 h-14 bg-gradient-to-br from-brand-500/30 to-purple-500/30 rounded-xl group-hover:scale-110 group-hover:rotate-3"
          whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
        >
          <Icon className="w-7 h-7 text-brand-400" />
        </motion.div>
        
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="leading-relaxed text-slate-400">{description}</p>
        
        <motion.div 
          className="mt-4 flex items-center gap-1 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <span className="text-sm">Learn more</span>
          <ArrowRight size={14} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ==================== ENHANCED STEP CARD ====================
const StepCard = ({ step, title, description, delay }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeUp}
      transition={{ delay }}
      className="relative text-center"
    >
      <div className="relative z-10">
        <motion.div 
          className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-3xl font-black text-white shadow-xl bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl shadow-brand-500/30"
          whileHover={{ scale: 1.15, rotate: 5, transition: { type: "spring", stiffness: 400 } }}
          animate={{ 
            boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.5)", "0 0 0px rgba(59,130,246,0)"]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: step * 0.3 }}
        >
          {step}
        </motion.div>
        
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="max-w-xs mx-auto text-sm text-slate-400">{description}</p>
      </div>
      
      {step < 4 && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5">
          <motion.div 
            className="absolute right-0 w-full h-full -translate-y-1/2 top-1/2 bg-gradient-to-r from-brand-500/80 to-transparent"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 1.5, delay: step * 0.3, repeat: Infinity }}
          />
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: step * 0.2 }}
          >
            <ArrowRight className="absolute right-0 w-5 h-5 -translate-y-1/2 top-1/2 text-brand-400" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// ==================== ANIMATED COUNTER ====================
const AnimatedCounter = ({ end, duration = 2, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      let startTime;
      const startValue = 0;
      
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * end);
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setCount(end);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ==================== TESTIMONIAL CAROUSEL ====================
const testimonials = [
  {
    name: "Rahul Sharma",
    role: "3rd Year Student",
    content: "The QR code system is incredibly fast! No more standing in queues for gate passes.",
    rating: 5,
    avatar: "👨‍🎓"
  },
  {
    name: "Dr. Meena Gupta",
    role: "Warden",
    content: "Managing gate passes digitally has made my job so much easier. Real-time tracking is a game changer.",
    rating: 5,
    avatar: "👩‍🏫"
  },
  {
    name: "Security Team",
    role: "Gate Security",
    content: "Scanning QR codes is super easy and we can verify instantly. Best system we've used!",
    rating: 5,
    avatar: "🛡️"
  },
  {
    name: "Prof. Anil Kumar",
    role: "HOD Computer Science",
    content: "Excellent system that ensures student safety while providing convenience.",
    rating: 5,
    avatar: "👨‍🏫"
  }
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 300 }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    })
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="p-8 text-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <div className="mb-4 text-6xl">{testimonials[current].avatar}</div>
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(testimonials[current].rating)].map((_, i) => (
              <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          <p className="mb-6 text-lg text-slate-300">"{testimonials[current].content}"</p>
          <h4 className="font-bold text-white">{testimonials[current].name}</h4>
          <p className="text-sm text-slate-500">{testimonials[current].role}</p>
        </motion.div>
      </AnimatePresence>
      
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110"
      >
        <ChevronRight size={24} className="text-white" />
      </button>
      
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === current ? "w-8 bg-brand-500" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ==================== ENHANCED ANIMATED BACKGROUND ====================
const AnimatedBackground = () => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Animated gradient orbs that follow mouse */}
      <motion.div 
        className="absolute w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[150px]"
        animate={{ 
          x: mousePos.x * 100 - 50,
          y: mousePos.y * 100 - 50
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
        animate={{ 
          x: (mousePos.x - 0.5) * -80,
          y: (mousePos.y - 0.5) * -80
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      />
      
      {/* Floating particles grid */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
      
      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// ==================== STATS SECTION ====================
const StatsSection = () => {
  const stats = [
    { label: "Active Users", value: 12500, suffix: "+", icon: Users },
    { label: "Gate Passes Issued", value: 45000, suffix: "+", icon: CheckCircle },
    { label: "Response Time", value: 2, suffix: "s", prefix: "<", icon: Zap },
    { label: "Security Rating", value: 99.9, suffix: "%", icon: Shield }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ y: -5, scale: 1.05 }}
          className="p-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
        >
          <div className="flex justify-center mb-3">
            <stat.icon className="w-8 h-8 text-brand-400" />
          </div>
          <div className="mb-1 text-4xl font-bold text-white">
            <AnimatedCounter end={stat.value} duration={2.5} suffix={stat.suffix} prefix={stat.prefix || ""} />
          </div>
          <div className="text-sm text-slate-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ==================== LIVE ACTIVITY FEED ====================
const ActivityFeed = () => {
  const activities = [
    { user: "Rahul M.", action: "requested gate pass", time: "2 min ago", icon: Bell },
    { user: "TG Sharma", action: "approved pass #1245", time: "15 min ago", icon: CheckCircle },
    { user: "Security Gate A", action: "scanned entry QR", time: "32 min ago", icon: QrCode },
    { user: "Warden Singh", action: "reviewed pending requests", time: "1 hour ago", icon: Users }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-brand-400" />
        <h3 className="text-lg font-semibold text-white">Live Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="p-2 rounded-lg bg-brand-500/20">
              <activity.icon className="w-4 h-4 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                <span className="font-semibold">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-slate-500">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== MAIN HOMEPAGE COMPONENT ====================
const HomePage = () => {
  const heroControls = useAnimation();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    if (heroInView) heroControls.start('visible');
  }, [heroControls, heroInView]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatedBackground />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pb-24 overflow-hidden pt-28 md:pt-40 md:pb-32">
        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={heroControls}
            variants={staggerContainer}
          >
            <motion.h1 
              variants={fadeUp}
              className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-8xl"
            >
              Hostel Gate <br />
              <motion.span 
                className="text-transparent bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
              >
                Pass System
              </motion.span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-slate-400"
            >
              Digital gate pass system for students, faculty & security – apply, approve, track, and scan QR codes seamlessly with real-time updates.
            </motion.p>

            <motion.div 
              variants={fadeUp}
              className="flex flex-col justify-center gap-5 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all shadow-lg group bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-1"
                >
                  Login to Portal 
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight size={18} />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all border group bg-white/5 hover:bg-white/10 border-white/10 rounded-xl hover:-translate-y-1 backdrop-blur-sm"
                >
                  Register as Student
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            className="absolute top-20 left-10 hidden lg:block"
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <QrCode size={32} className="text-brand-400" />
            </div>
          </motion.div>
          
          <motion.div
            className="absolute bottom-20 right-10 hidden lg:block"
            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Shield size={32} className="text-purple-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/5 border-y border-white/5">
        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Smart, Fast & Secure
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-slate-400">
              Everything you need to manage hostel gate passes digitally
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard 
              icon={QrCode} 
              title="QR Code Based" 
              description="Generate and scan QR codes for contactless gate entry/exit with real-time validation and security." 
              index={0}
            />
            <FeatureCard 
              icon={Users} 
              title="Multi‑Role System" 
              description="Admin, Students, TG, Warden, Security, HOD – each with dedicated dashboards and permissions." 
              index={1}
            />
            <FeatureCard 
              icon={Clock} 
              title="Real‑time Tracking" 
              description="Monitor who is outside the hostel, approval status, and complete historical logs with analytics." 
              index={2}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-white md:text-5xl">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400">
              Simple, transparent workflow from request to exit
            </motion.p>
          </motion.div>

          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4">
            <StepCard step={1} title="Student Applies" description="Student submits gate pass request with reason & dates" delay={0.1} />
            <StepCard step={2} title="TG Approves" description="Tutor Guardian reviews and forwards to Warden" delay={0.2} />
            <StepCard step={3} title="Warden Signs" description="Warden final approval & QR code generated" delay={0.3} />
            <StepCard step={4} title="Security Scans" description="Security scans QR to log exit/entry automatically" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Testimonials & Activity Section */}
      <section className="py-24 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-pink-500/10">
        <div className="container px-4 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <div className="mb-8 text-center lg:text-left">
                <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                  What People Say
                </h2>
                <p className="text-slate-400">Trusted by thousands of students and staff</p>
              </div>
              <TestimonialCarousel />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <ActivityFeed />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Badge Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20">
                <Lock size={48} className="text-brand-400" />
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Enterprise Grade Security
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-8 text-lg text-slate-400">
              Your data is protected with end-to-end encryption, secure authentication, and regular security audits.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6">
              {["256-bit SSL", "GDPR Compliant", "2FA Ready", "Auto Backup"].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-white">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-pink-500/20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="p-12 border bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
            >
              <motion.h2 
                className="mb-4 text-3xl font-bold text-white md:text-5xl"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready to modernize your hostel?
              </motion.h2>
              <p className="mb-8 text-lg text-slate-300">
                Join thousands of students and staff who enjoy a paperless, efficient gate pass system.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-10 py-4 font-bold transition-all bg-white shadow-xl text-slate-900 hover:bg-gray-100 rounded-xl hover:-translate-y-1"
                >
                  Get Started Now 
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight size={18} />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-sm text-center border-t border-white/10 text-slate-500">
        <p>© 2026 Hostel Gate Pass System – Secure. Fast. Paperless. | v3.0</p>
      </footer>
    </div>
  );
};

export default HomePage;