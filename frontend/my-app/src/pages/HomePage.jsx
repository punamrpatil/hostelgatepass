import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  Shield, QrCode, Users, Clock, CheckCircle, ArrowRight, 
  Zap, Sparkles, Layers, Fingerprint, Globe, Cpu 
} from 'lucide-react';

// Animation variants
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

const FeatureCard = ({ icon: Icon, title, description, delay, index }) => {
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
      whileHover={{ y: -12, transition: { duration: 0.2 } }}
      className="relative p-6 transition-all duration-300 border group bg-white/5 backdrop-blur-sm rounded-2xl border-white/10 hover:border-brand-500/60 hover:shadow-2xl hover:shadow-brand-500/20"
    >
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-br from-brand-500/5 to-transparent group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-5 transition-all duration-300 w-14 h-14 bg-gradient-to-br from-brand-500/30 to-purple-500/30 rounded-xl group-hover:scale-110 group-hover:rotate-3">
          <Icon className="w-7 h-7 text-brand-400" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="leading-relaxed text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
};

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
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {step}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="max-w-xs mx-auto text-sm text-slate-400">{description}</p>
      </div>
      {step < 4 && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5">
          <div className="absolute right-0 w-full h-full -translate-y-1/2 top-1/2 bg-gradient-to-r from-brand-500/80 to-transparent" />
          <ArrowRight className="absolute right-0 w-5 h-5 -translate-y-1/2 top-1/2 text-brand-400 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[150px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute w-32 h-32 rounded-full top-20 left-10 bg-yellow-500/20 blur-3xl"
        animate={{ y: [0, 30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full bottom-40 right-20 bg-pink-500/20 blur-3xl"
        animate={{ y: [0, -40, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

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
              <span className="text-transparent bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text">
               Pass System
              </span>
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
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all shadow-lg group bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-1"
              >
                Login to Portal 
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all border group bg-white/5 hover:bg-white/10 border-white/10 rounded-xl hover:-translate-y-1 backdrop-blur-sm"
              >
                Register as Student
              </Link>
            </motion.div>
          </motion.div>
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

      {/* Stats / CTA */}
      <section className="py-24 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-pink-500/10">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="p-12 border bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
            >
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
                Ready to modernize your hostel?
              </h2>
              <p className="mb-8 text-lg text-slate-300">
                Join thousands of students and staff who enjoy a paperless, efficient gate pass system.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 font-bold transition-all bg-white shadow-xl text-slate-900 hover:bg-gray-100 rounded-xl hover:-translate-y-1"
              >
                Get Started Now <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-sm text-center border-t border-white/10 text-slate-500">
        <p>© 2025 Hostel Gate Pass System – Secure. Fast. Paperless. | v2.0</p>
      </footer>
    </div>
  );
};

export default HomePage;