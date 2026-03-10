import { Wand2, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface CreatePresentationProps {
  onSelectFromScratch: () => void;
  onSelectProcessContent: () => void;
  onSelectKnowItAll: () => void;
}

export function CreatePresentation({ onSelectFromScratch, onSelectProcessContent, onSelectKnowItAll }: CreatePresentationProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:p-8">
      {/* Hero Section with Logo + Intro */}
      <div className="text-center mb-8 sm:mb-12">
        <img src="/logo.png" alt="VerbaDeck" className="h-16 sm:h-20 mx-auto mb-4" />
        <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Speak naturally and your slides advance automatically when you say the right words — no clicking, no keyboard, just your voice. Build presentations with AI, process existing scripts, or practice handling tough questions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {/* From Scratch Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-brand-teal group flex flex-col"
          onClick={onSelectFromScratch}
        >
          <CardContent className="p-4 sm:p-8 text-center flex flex-col flex-1">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-sky-50 group-hover:bg-sky-100 transition-colors">
                <Wand2 className="w-10 h-10 sm:w-16 sm:h-16 text-brand-deep" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2 sm:mb-4 group-hover:text-brand-teal transition-colors">
              Create from Scratch
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-body">
              Answer a few questions and let AI generate your presentation. Choose from multiple slide options and customize everything.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg font-body">
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>AI asks you questions about your topic</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Get multiple slide options to choose from</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Perfect for new presentations</span>
              </div>
            </div>

            <div className="flex-1" />
            <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-brand-deep to-brand-teal text-white rounded-lg hover:opacity-90 font-heading font-semibold transition-all shadow-md">
              Start from Scratch
            </button>
          </CardContent>
        </Card>

        {/* Process Content Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-brand-teal group flex flex-col"
          onClick={onSelectProcessContent}
        >
          <CardContent className="p-4 sm:p-8 text-center flex flex-col flex-1">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-sky-50 group-hover:bg-sky-100 transition-colors">
                <FileText className="w-10 h-10 sm:w-16 sm:h-16 text-brand-deep" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2 sm:mb-4 group-hover:text-brand-teal transition-colors">
              Process Existing Content
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-body">
              Paste your script or upload PowerPoint files. AI automatically creates voice-driven slides with trigger words.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg font-body">
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Paste text script or upload PowerPoint</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>AI splits into sections automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Great for existing presentations</span>
              </div>
            </div>

            <div className="flex-1" />
            <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-brand-deep to-brand-teal text-white rounded-lg hover:opacity-90 font-heading font-semibold transition-all shadow-md">
              Process Content
            </button>
          </CardContent>
        </Card>

        {/* Know It All Wall Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-brand-teal group flex flex-col"
          onClick={onSelectKnowItAll}
        >
          <CardContent className="p-4 sm:p-8 text-center flex flex-col flex-1">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-sky-50 group-hover:bg-sky-100 transition-colors">
                <Brain className="w-10 h-10 sm:w-16 sm:h-16 text-brand-deep" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2 sm:mb-4 group-hover:text-brand-teal transition-colors">
              Know It All Wall
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-body">
              Practice answering questions with voice-activated keyword confirmation. Perfect for interview prep and Q&A sessions.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg font-body">
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Upload your knowledge base or resume</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Practice with voice keyword confirmation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-teal font-bold">✓</span>
                <span>Perfect for interviews & training</span>
              </div>
            </div>

            <div className="flex-1" />
            <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-brand-deep to-brand-teal text-white rounded-lg hover:opacity-90 font-heading font-semibold transition-all shadow-md">
              Start Q&A Practice
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 font-body">
        <p>All modes feature AI-powered voice control and intelligent question generation</p>
      </div>
    </div>
  );
}
