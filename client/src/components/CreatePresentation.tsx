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
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Welcome to VerbaDeck
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Choose your path: Create presentations or practice Q&A sessions
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* From Scratch Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-500 group"
          onClick={onSelectFromScratch}
        >
          <CardContent className="p-4 sm:p-8 text-center">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Wand2 className="w-10 h-10 sm:w-16 sm:h-16 text-blue-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 group-hover:text-blue-600 transition-colors">
              Create from Scratch
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Answer a few questions and let AI generate your presentation. Choose from multiple slide options and customize everything.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>AI asks you questions about your topic</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Get multiple slide options to choose from</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Perfect for new presentations</span>
              </div>
            </div>

            <button className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md">
              Start from Scratch
            </button>
          </CardContent>
        </Card>

        {/* Process Content Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-500 group"
          onClick={onSelectProcessContent}
        >
          <CardContent className="p-4 sm:p-8 text-center">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <FileText className="w-10 h-10 sm:w-16 sm:h-16 text-blue-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 group-hover:text-blue-600 transition-colors">
              Process Existing Content
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Paste your script or upload PowerPoint files. AI automatically creates voice-driven slides with trigger words.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Paste text script or upload PowerPoint</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>AI splits into sections automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Great for existing presentations</span>
              </div>
            </div>

            <button className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md">
              Process Content
            </button>
          </CardContent>
        </Card>
        {/* Know It All Wall Option */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-500 group"
          onClick={onSelectKnowItAll}
        >
          <CardContent className="p-4 sm:p-8 text-center">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="p-4 sm:p-6 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Brain className="w-10 h-10 sm:w-16 sm:h-16 text-blue-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 group-hover:text-blue-600 transition-colors">
              Know It All Wall
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Practice answering questions with voice-activated keyword confirmation. Perfect for interview prep and Q&A sessions.
            </p>

            <div className="hidden sm:block space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Upload your knowledge base or resume</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Practice with voice keyword confirmation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Perfect for interviews & training</span>
              </div>
            </div>

            <button className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md">
              Start Q&A Practice
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>All modes feature AI-powered voice control and intelligent question generation</p>
      </div>
    </div>
  );
}
