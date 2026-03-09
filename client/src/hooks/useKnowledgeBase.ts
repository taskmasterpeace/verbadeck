import { useState } from 'react';
import { useOpenRouter } from './useOpenRouter';
import { type Section } from '../lib/script-parser';
import { usePresentationStore } from '@/stores/usePresentationStore';

interface UseKnowledgeBaseProps {
  sections: Section[];
  getOperationModel: (operation: string) => string | undefined;
  onTabChange?: (tab: 'knowledge') => void;
}

/**
 * Custom hook to manage knowledge base (FAQ) operations
 */
export function useKnowledgeBase({ sections, getOperationModel, onTabChange }: UseKnowledgeBaseProps) {
  const [knowledgeBase, setKnowledgeBase] = useState<{ question: string; answer: string }[]>([]);

  // Read sharedKnowledgeBase from Zustand store instead of localStorage
  const sharedKnowledgeBase = usePresentationStore((state) => state.sharedKnowledgeBase);
  const setSharedKnowledgeBase = usePresentationStore((state) => state.setSharedKnowledgeBase);

  const [isGeneratingFAQs, setIsGeneratingFAQs] = useState(false);

  const { generateFAQs } = useOpenRouter();

  /**
   * Generate FAQs from presentation content
   */
  const handleGenerateFAQs = async () => {
    if (sections.length === 0) {
      alert('Please create sections first');
      return;
    }

    setIsGeneratingFAQs(true);
    try {
      const presentationContent = sections.map(s => s.content).join('\n\n');
      const faqModel = getOperationModel('generateFAQs');
      const faqs = await generateFAQs(presentationContent, faqModel);

      // Replace existing FAQs with newly generated ones
      setKnowledgeBase(faqs);

      // Switch to knowledge base tab to show results
      if (onTabChange) {
        onTabChange('knowledge');
      }

      console.log(`✅ Generated ${faqs.length} FAQs`);
    } catch (error) {
      console.error('Failed to generate FAQs:', error);
      alert('Failed to generate FAQs. Please try again.');
    } finally {
      setIsGeneratingFAQs(false);
    }
  };

  return {
    knowledgeBase,
    setKnowledgeBase,
    sharedKnowledgeBase,
    setSharedKnowledgeBase,
    isGeneratingFAQs,
    handleGenerateFAQs,
  };
}
