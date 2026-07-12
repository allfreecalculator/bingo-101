import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ShieldAlert, 
  Mail, 
  Users, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building,
  Globe2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface PolicyDocumentsProps {
  onClose: () => void;
  initialTab?: 'about' | 'contact' | 'privacy' | 'terms';
}

export const PolicyDocuments: React.FC<PolicyDocumentsProps> = ({ 
  onClose,
  initialTab = 'privacy' 
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact' | 'privacy' | 'terms'>(initialTab);
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    
    // Quick email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate safe server request for simulated contact logging
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
      });
    }, 1200);
  };

  return (
    <div id="policy-modal-container" className="bg-[#0a0a23] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full text-white flex flex-col h-[85vh] max-h-[720px]">
      
      {/* Modal Header */}
      <div className="p-6 bg-[#050514] border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Bingo 101 Casino</h2>
            <p className="text-[10px] text-white/50 font-mono">Simulated Casino Lobby & Support Desk</p>
          </div>
        </div>
        <button 
          id="close-policy-modal"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto bg-[#07071c] border-b border-white/5 shrink-0 px-2 pt-2 gap-1 scrollbar-none">
        {[
          { id: 'about', label: 'About Us', icon: Users },
          { id: 'contact', label: 'Contact Us', icon: Mail },
          { id: 'privacy', label: 'Privacy Policy', icon: FileText },
          { id: 'terms', label: 'Terms & Conditions', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSubmitSuccess(false);
                setSubmitError(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold font-mono tracking-wide rounded-t-xl transition-all cursor-pointer select-none border-t border-x ${
                isActive 
                  ? 'bg-[#0a0a23] text-amber-400 border-white/10 border-b-[#0a0a23] relative z-10' 
                  : 'bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0a0a23] text-sm text-white/80 leading-relaxed font-sans scrollbar-thin">
        
        {/* TAB 1: ABOUT US */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">Our Corporate Mission</span>
              <h3 className="text-xl font-black text-white tracking-tight">About Bingo 101 Casino</h3>
              <p className="text-white/60 text-xs">Empowering the world of social gaming through fair, clear, and high-performance simulation engineering.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <Building className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">100% Simulated</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">We focus on building math-based simulators with zero monetary deposits, offering a safe environment to learn system behavior.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">Vegas-Style Engine</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">Our advanced 75-Ball auto-daub combinations, multiplier slot mechanics, and crash algorithms replicate physical boards perfectly.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">Vault Encryption</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">Your simulated chips and level progressions are securely logged locally or stored inside our Firestore cloud framework.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Core Values & Transparency</h4>
              <p className="text-xs text-white/70">
                At Bingo 101 Casino, we believe entertainment platforms should be highly transparent, transparent, and responsive. Our applications are designed with desktop-first precision and absolute mobile-first performance, keeping browser footprint low. We do not promote real-world betting, and all games use mock chips issued upon claim or completed daily assignments.
              </p>
              <p className="text-xs text-white/70">
                This website hosts custom simulation tools designed to help players analyze combinations and play safely. We display standard, highly moderated advertising through networks like Google AdSense to offset the real-time server maintenance costs of holding secure database storage.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT US */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">Responsive Help Desk</span>
              <h3 className="text-xl font-black text-white tracking-tight">Contact Our Casino Support Team</h3>
              <p className="text-white/60 text-xs">Have suggestions for new casino games, feedback on our simulators, or inquiries about your simulated chips? Message our support team directly.</p>
            </div>

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto my-6"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white font-mono uppercase">MESSAGE RECEIVED!</h4>
                    <p className="text-xs text-white/70">
                      Your message has been logged. Our gaming community support will review your feedback and reach out within 24 business hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    SEND ANOTHER QUERY
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleFormSubmit}
                  className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5"
                >
                  {submitError && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-white/50 font-mono uppercase tracking-wider">
                        Full Name / Agency <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Inspector John Doe"
                        className="w-full bg-[#11112e] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-white/50 font-mono uppercase tracking-wider">
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. contact@agency.com"
                        className="w-full bg-[#11112e] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>



                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-white/50 font-mono uppercase tracking-wider">
                      Your Message / Inquiry Details <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please state your inquiry here clearly..."
                      className="w-full bg-[#11112e] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'TRANSMITTING MESSAGE...' : <><Send className="w-4 h-4" /> DISPATCH INQUIRY</>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="text-center text-[10px] text-white/30 font-mono">
              Corporate Headquarters: Bingo 101 Casino, Simulated Plaza Floor 10, Vegas Cloud Node 778
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-fade-in text-xs text-white/70">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">Effective July 11, 2026</span>
              <h3 className="text-xl font-black text-white tracking-tight">Privacy Policy</h3>
              <p className="text-white/60">Your safety is our top priority. Learn how we handle cookies, diagnostics, and Google AdSense partner integration data.</p>
            </div>

            <div className="space-y-4">
              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">1. Consent</h4>
                <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms. All chips, logs, and simulated profiles are maintained under complete server transparency.</p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">2. Information We Collect</h4>
                <p>
                  When you access Bingo 101 Casino, we may collect browser metadata, diagnostic variables, click rates, and secure registration usernames (simulated only). If you contact us directly, we may receive additional details like your name, email, the contents of the message, and attachments you choose to send.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">3. Log Files</h4>
                <p>
                  Bingo 101 Casino follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2 bg-amber-400/5 p-3 rounded-r-xl">
                <h4 className="font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> 4. Google DoubleClick DART Cookies & AdSense
                </h4>
                <p className="text-white/80">
                  Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300">https://policies.google.com/technologies/ads</a>
                </p>
                <p className="mt-2 text-white/80">
                  Some of the advertisers on our site may use cookies and web beacons. Our advertising partners include **Google AdSense**. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we link to their Privacy Policies directly.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">5. Third Party Privacy Policies</h4>
                <p>
                  Bingo 101 Casino's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">6. GDPR & CCPA Data Protection Rights</h4>
                <p>
                  We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-white/60">
                  <li><strong>The right to access</strong> – You have the right to request copies of your personal data held in local/session caches.</li>
                  <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
                  <li><strong>The right to erasure</strong> – You have the right to request that we erase your diagnostic logs or simulated profile data.</li>
                  <li><strong>The right to restrict/object to processing</strong> – You have the right to restrict our diagnostic parsing of layout elements.</li>
                </ul>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">7. Children's Information</h4>
                <p>
                  Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Bingo 101 Casino does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TERMS & CONDITIONS */}
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-fade-in text-xs text-white/70">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">Last Revised: July 2026</span>
              <h3 className="text-xl font-black text-white tracking-tight">Terms and Conditions</h3>
              <p className="text-white/60">By entering our casino simulator suite, you agree to comply with the rules outlined below.</p>
            </div>

            <div className="space-y-4">
              <div className="border-l-2 border-amber-400 pl-4 space-y-2 bg-red-400/5 p-3 rounded-r-xl">
                <h4 className="font-bold text-red-400 uppercase font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400" /> NO REAL MONEY GAMBLING
                </h4>
                <p className="text-white/80 font-semibold">
                  Bingo 101 Casino is an online gaming entertainment simulator. No real money can be wagered, earned, deposited, or withdrawn. All virtual tokens ("chips", "coins") are completely simulated, possess zero monetary value, and cannot be traded or redeemed for physical products.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">1. Agreement to Terms</h4>
                <p>
                  These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and Bingo 101 Casino, concerning your access to and use of our web application.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">2. Intellectual Property Rights</h4>
                <p>
                  Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") are owned or licensed to us, protected by copyright and trademark laws.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">3. User Representations</h4>
                <p>
                  By using the Site, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Site for any illegal or unauthorized purpose.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">4. Prohibited Activities</h4>
                <p>
                  You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us (such as Google AdSense publisher rules).
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">5. Limitation of Liability</h4>
                <p>
                  IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 space-y-2">
                <h4 className="font-bold text-white uppercase font-mono">6. Governing Law</h4>
                <p>
                  These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws applicable to internet applications and cloud microservices, without regard to conflict of law principles.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal Footer */}
      <div className="p-4 bg-[#050514] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-white/40 shrink-0 gap-2">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Secure gameplay diagnostics and local logging active
        </span>
        <span>© 2026 BINGO 101 CASINO INC.</span>
      </div>

    </div>
  );
};
