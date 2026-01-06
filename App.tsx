
import React, { useState, useCallback, useEffect } from 'react';
import { FormData, Step, StepKey, Entity } from './types';
import { Input } from './components/Input';
import { StepIndicator } from './components/StepIndicator';
import { generateClientSummary } from './services/geminiService';
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Sparkles, 
  Building2, 
  Wallet, 
  User, 
  PieChart, 
  Check, 
  Plus, 
  Trash2, 
  Users, 
  Briefcase,
  Layers,
  ShieldCheck,
  Hexagon,
  Loader2
} from 'lucide-react';

// --- CONFIGURATION ---
// Replace this with your Workato Webhook URL
const WEBHOOK_URL = 'https://hooks.workato.com/your-endpoint-here';

const STEPS: Step[] = [
  { key: 'identity', label: 'Identity', description: 'Personal and family details' },
  { key: 'tax', label: 'Tax Profile', description: 'Australian tax identity' },
  { key: 'entities', label: 'Entities', description: 'Business & investment structures' },
  { key: 'income', label: 'Financials', description: 'Income and investments' },
  { key: 'wealth', label: 'Strategy', description: 'Wealth and planning goals' },
  { key: 'review', label: 'Review', description: 'Confirmation and AI insights' },
];

const INITIAL_DATA: FormData = {
  firstName: '',
  lastName: '',
  dob: '',
  email: '',
  phone: '',
  address: '',
  hasSpouse: false,
  spouseName: '',
  spouseDoingReturn: false,
  hasEntities: false,
  entities: [],
  tfn: '',
  residencyStatus: 'resident',
  hasMedicareCard: false,
  medicareNumber: '',
  annualSalary: 0,
  hasInterestIncome: false,
  hasDividends: false,
  hasRentalProperty: false,
  hasSideHustle: false,
  superBalance: 0,
  totalAssets: 0,
  totalDebts: 0,
  primaryGoal: '',
};

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStep = STEPS[currentStepIndex];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCheckboxChange = (name: keyof FormData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const addEntity = () => {
    const newEntity: Entity = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'company',
      name: '',
      abn: '',
      activity: '',
    };
    setFormData(prev => ({
      ...prev,
      entities: [...prev.entities, newEntity]
    }));
  };

  const updateEntity = (id: string, field: keyof Entity, value: string) => {
    setFormData(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEntity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      entities: prev.entities.filter(e => e.id !== id)
    }));
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (currentStep.key === 'review' && !aiSummary && !isGeneratingSummary) {
      const getSummary = async () => {
        setIsGeneratingSummary(true);
        const summary = await generateClientSummary(formData);
        setAiSummary(summary);
        setIsGeneratingSummary(false);
      };
      getSummary();
    }
  }, [currentStep.key, formData, aiSummary, isGeneratingSummary]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Sending data to Workato Webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          aiInsight: aiSummary,
          submittedAt: new Date().toISOString(),
          source: 'Private Portal Onboarding'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to transmit data: ${response.statusText}`);
      }

      console.log("Onboarding Data Synchronized with Workato:", formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Webhook Submission Error:", error);
      setSubmitError("We encountered an issue synchronising your data with the server. Please try again or contact support.");
      // For demo purposes, we still allow completion if the user wants to see the success state
      // setIsSubmitted(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep.key) {
      case 'identity':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Legal first name" />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Surname" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Primary contact email" />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Spouse Profile</h3>
                  <p className="text-xs text-slate-500 mt-1">Include details for joint wealth planning.</p>
                </div>
                <button 
                  onClick={() => handleCheckboxChange('hasSpouse')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent
                    ${formData.hasSpouse ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasSpouse ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {formData.hasSpouse && (
                <div className="space-y-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 animate-in zoom-in-95 duration-300">
                  <Input label="Spouse Full Name" name="spouseName" value={formData.spouseName} onChange={handleInputChange} placeholder="Full legal name" />
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <input 
                      type="checkbox" 
                      id="spouseDoingReturn"
                      checked={formData.spouseDoingReturn} 
                      onChange={() => handleCheckboxChange('spouseDoingReturn')}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="spouseDoingReturn" className="text-sm font-medium text-slate-700 cursor-pointer">
                      A tax return is also required for this individual
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Input label="Tax File Number (TFN)" name="tfn" value={formData.tfn} onChange={handleInputChange} placeholder="000 000 000" maxLength={9} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Australian Tax Residency</label>
              <select 
                name="residencyStatus" 
                value={formData.residencyStatus} 
                onChange={handleInputChange}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="resident">Resident for Tax Purposes</option>
                <option value="non-resident">Non-Resident</option>
                <option value="working-holiday">Working Holiday Maker</option>
              </select>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Medicare Access?</p>
                <p className="text-xs text-slate-500">Required for Levy Surcharge assessments.</p>
              </div>
              <input 
                type="checkbox" 
                checked={formData.hasMedicareCard} 
                onChange={() => handleCheckboxChange('hasMedicareCard')}
                className="w-5 h-5 accent-indigo-600 cursor-pointer"
              />
            </div>
            {formData.hasMedicareCard && (
              <Input label="Medicare Card Number" name="medicareNumber" value={formData.medicareNumber} onChange={handleInputChange} placeholder="Number and reference" />
            )}
          </div>
        );

      case 'entities':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-2xl shadow-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/80">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Business Entities</h3>
                  <p className="text-xs text-slate-400">Companies, Trusts, SMSFs, or Partnerships</p>
                </div>
              </div>
              <button 
                onClick={() => handleCheckboxChange('hasEntities')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                  ${formData.hasEntities ? 'bg-indigo-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasEntities ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {formData.hasEntities && (
              <div className="space-y-6">
                {formData.entities.map((entity, index) => (
                  <div key={entity.id} className="relative p-6 rounded-2xl border border-slate-200 bg-white shadow-sm animate-in slide-in-from-right-4 duration-300">
                    <button 
                      onClick={() => removeEntity(entity.id)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <h4 className="font-bold text-slate-800">Entity Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Entity Type</label>
                        <select 
                          value={entity.type}
                          onChange={(e) => updateEntity(entity.id, 'type', e.target.value as any)}
                          className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm"
                        >
                          <option value="company">Company</option>
                          <option value="trust">Family/Unit Trust</option>
                          <option value="smsf">SMSF</option>
                          <option value="partnership">Partnership</option>
                        </select>
                      </div>
                      <Input 
                        label="Entity Legal Name" 
                        value={entity.name} 
                        onChange={(e) => updateEntity(entity.id, 'name', e.target.value)}
                        placeholder="Registered Name"
                      />
                      <Input 
                        label="ABN or TFN" 
                        value={entity.abn} 
                        onChange={(e) => updateEntity(entity.id, 'abn', e.target.value)}
                        placeholder="Registration Number"
                      />
                      <Input 
                        label="Primary Activity" 
                        value={entity.activity} 
                        onChange={(e) => updateEntity(entity.id, 'activity', e.target.value)}
                        placeholder="Nature of Business"
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addEntity}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Plus size={20} />
                  Register Additional Structure
                </button>
              </div>
            )}
          </div>
        );

      case 'income':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Input label="Gross Annual Salary" name="annualSalary" type="number" value={formData.annualSalary} onChange={handleInputChange} placeholder="Primary income amount" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Bank Interest', key: 'hasInterestIncome' },
                { label: 'Share Dividends', key: 'hasDividends' },
                { label: 'Rental Property', key: 'hasRentalProperty' },
                { label: 'ABN / Side Business', key: 'hasSideHustle' },
              ].map(item => (
                <div key={item.key} 
                     onClick={() => handleCheckboxChange(item.key as keyof FormData)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3
                       ${formData[item.key as keyof FormData] ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                    ${formData[item.key as keyof FormData] ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                    {formData[item.key as keyof FormData] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'wealth':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Total Superannuation" name="superBalance" type="number" value={formData.superBalance} onChange={handleInputChange} />
              <Input label="Investment Assets" name="totalAssets" type="number" value={formData.totalAssets} onChange={handleInputChange} />
            </div>
            <Input label="Consolidated Liabilities (Debt)" name="totalDebts" type="number" value={formData.totalDebts} onChange={handleInputChange} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Financial Objectives</label>
              <textarea
                name="primaryGoal"
                value={formData.primaryGoal}
                onChange={handleInputChange}
                rows={3}
                placeholder="Briefly describe your primary wealth management or tax goals."
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Strategic Insight</h3>
              </div>
              <div className="relative z-10 text-slate-300 prose prose-invert max-w-none">
                {isGeneratingSummary ? (
                  <div className="flex flex-col gap-3 py-4">
                    <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/20 rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryCard icon={<User size={18} />} title="Lead Member" value={`${formData.firstName} ${formData.lastName}`} />
              <SummaryCard icon={<Users size={18} />} title="Spouse Profile" value={formData.hasSpouse ? `${formData.spouseName}` : 'Individual'} />
              <SummaryCard icon={<Briefcase size={18} />} title="Complexity" value={formData.hasEntities ? `${formData.entities.length} Managed Entities` : 'Standard Individual'} />
              <SummaryCard icon={<Wallet size={18} />} title="Primary Income" value={`$${formData.annualSalary.toLocaleString()}`} />
            </div>

            {formData.hasEntities && (
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Entities Identified</h4>
                <div className="space-y-3">
                  {formData.entities.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <Building2 size={14} />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-700">{e.name}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-semibold">{e.type}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500">{e.abn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in shake duration-300">
                {submitError}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-100/50 animate-in zoom-in-50 duration-500">
          <ShieldCheck size={48} strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Onboarding Complete</h1>
        <p className="text-lg text-slate-500 max-w-md mb-8 leading-relaxed">
          Your documentation has been securely processed and integrated into your advisor's <span className="text-indigo-600 font-bold">Workato</span> environment.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-slate-950 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
        >
          Close Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfdfd]">
      {/* Sidebar - Professional & Brand Neutral */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-slate-950 text-white p-12 flex-col justify-between border-r border-slate-900 shadow-2xl">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 ring-1 ring-white/10">
              <Hexagon size={28} strokeWidth={1.5} fill="currentColor" fillOpacity={0.05} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-none">PORTAL</span>
              <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1.5 block">Wealth & Compliance</span>
            </div>
          </div>
          <div className="space-y-10">
            {STEPS.map((s, idx) => (
              <div key={s.key} className={`flex items-start gap-4 transition-all duration-300 ${idx === currentStepIndex ? 'opacity-100 translate-x-2' : 'opacity-25'}`}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold transition-colors
                  ${idx <= currentStepIndex ? 'bg-white border-white text-slate-950' : 'border-slate-800 text-slate-600'}`}>
                   {idx < currentStepIndex ? <Check size={18} /> : idx + 1}
                </div>
                <div className="pt-0.5">
                  <h4 className="font-bold text-sm tracking-wide">{s.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-8 font-bold tracking-widest uppercase space-y-2">
          <p>© 2025 PORTAL SERVICES</p>
          <p className="text-slate-800 flex items-center gap-2">
             <ShieldCheck size={10} /> ENCRYPTED CLIENT GATEWAY
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
             <div className="md:hidden flex items-center gap-2 mb-10">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center font-black text-sm text-white">
                  <Hexagon size={16} />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Portal</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest tracking-[0.2em]">Section {currentStepIndex + 1} of {STEPS.length}</span>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
              {currentStep.label}
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-lg">
              {currentStep.description}
            </p>
          </div>

          <div className="md:hidden mb-12">
            <StepIndicator steps={STEPS} currentStepIndex={currentStepIndex} />
          </div>

          <div className="min-h-[400px]">
             {renderStepContent()}
          </div>

          <div className="flex items-center justify-between mt-20 pt-10 border-t border-slate-100 sticky bottom-0 bg-[#fdfdfd] pb-8 md:pb-0 z-20">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0 || isSubmitting}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-200
                ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50 disabled:opacity-50'}`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            
            <button
              onClick={currentStep.key === 'review' ? handleSubmit : nextStep}
              disabled={isSubmitting}
              className="group flex items-center gap-3 px-10 py-4 bg-slate-950 text-white font-bold rounded-2xl hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-200 shadow-2xl shadow-slate-200 active:translate-y-0 disabled:opacity-80 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>Synchronising... <Loader2 size={20} className="animate-spin" /></>
              ) : currentStep.key === 'review' ? (
                <>Complete Onboarding <Send size={20} /></>
              ) : (
                <>Next Step <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
          
          <p className="text-center mt-8 text-[10px] text-slate-300 font-medium tracking-wide">
            Your data is encrypted end-to-end and transmitted over a secure SSL gateway.
          </p>
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | undefined }) => (
  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start gap-4 hover:border-slate-200 transition-colors">
    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1.5">{title}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value || 'Not Specified'}</p>
    </div>
  </div>
);
