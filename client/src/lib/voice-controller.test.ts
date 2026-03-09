import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceController } from './voice-controller';
import { Section } from './script-parser';

describe('VoiceController', () => {
  let controller: VoiceController;

  beforeEach(() => {
    controller = new VoiceController();
    controller.resetDebounce();
  });

  describe('detectBackCommand', () => {
    it('should detect "back" command', () => {
      expect(controller.detectBackCommand('back')).toBe(true);
      expect(controller.detectBackCommand('go back')).toBe(true);
      expect(controller.detectBackCommand('please go back')).toBe(true);
    });

    it('should detect "previous" command', () => {
      expect(controller.detectBackCommand('previous')).toBe(true);
      expect(controller.detectBackCommand('previous slide')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(controller.detectBackCommand('BACK')).toBe(true);
      expect(controller.detectBackCommand('Previous')).toBe(true);
      expect(controller.detectBackCommand('GO BACK')).toBe(true);
    });

    it('should use word boundaries to prevent false positives', () => {
      // "feedback" contains "back" but should not match
      expect(controller.detectBackCommand('feedback')).toBe(false);
      expect(controller.detectBackCommand('the feedback was positive')).toBe(false);
    });

    it('should return false for non-back commands', () => {
      expect(controller.detectBackCommand('next')).toBe(false);
      expect(controller.detectBackCommand('forward')).toBe(false);
      expect(controller.detectBackCommand('hello world')).toBe(false);
    });
  });

  describe('detectTriggerWords', () => {
    it('should detect primary trigger word', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      const result = controller.detectTriggerWords('this is a moment', section, 0);
      expect(result).toBe(1); // Should advance to section 1
    });

    it('should detect plural forms of trigger words', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      // "moments" should match "moment" trigger
      expect(controller.detectTriggerWords('these are moments', section, 0)).toBe(1);
      expect(controller.detectTriggerWords('the moment', section, 0)).toBe(1);
    });

    it('should detect multiple selected triggers', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'time',
        selectedTriggers: ['time', 'opportunity', 'chance'],
      };

      expect(controller.detectTriggerWords('now is the time', section, 0)).toBe(1);
      expect(controller.detectTriggerWords('a great opportunity', section, 0)).toBe(1);
      expect(controller.detectTriggerWords('take your chance', section, 0)).toBe(1);
    });

    it('should be case insensitive', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      expect(controller.detectTriggerWords('MOMENT', section, 0)).toBe(1);
      expect(controller.detectTriggerWords('Moment', section, 0)).toBe(1);
      expect(controller.detectTriggerWords('MoMeNt', section, 0)).toBe(1);
    });

    it('should return null when no trigger matches', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      expect(controller.detectTriggerWords('no match here', section, 0)).toBe(null);
      expect(controller.detectTriggerWords('random text', section, 0)).toBe(null);
    });

    it('should fallback to advanceToken if selectedTriggers is empty', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: [],
      };

      // Should use advanceToken as fallback
      expect(controller.detectTriggerWords('this is a moment', section, 0)).toBe(1);
    });

    it('should handle complex words with "es" and "ies" suffixes', () => {
      const section1: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'opportunity',
        selectedTriggers: ['opportunity'],
      };

      // "opportunities" should match "opportunity"
      expect(controller.detectTriggerWords('many opportunities', section1, 0)).toBe(1);

      const section2: Section = {
        id: '2',
        content: 'Test content',
        advanceToken: 'box',
        selectedTriggers: ['box'],
      };

      // "boxes" should match "box"
      expect(controller.detectTriggerWords('several boxes', section2, 0)).toBe(1);
    });
  });

  describe('detectQuestion', () => {
    it('should detect questions with question marks', () => {
      const question = 'What is your name?';
      expect(controller.detectQuestion(question, true)).toBe(question);
    });

    it('should only detect on final transcripts', () => {
      const question = 'What is your name?';
      expect(controller.detectQuestion(question, false)).toBe(null);
      expect(controller.detectQuestion(question, true)).toBe(question);
    });

    it('should return null for non-questions', () => {
      expect(controller.detectQuestion('This is a statement', true)).toBe(null);
      expect(controller.detectQuestion('Hello world', true)).toBe(null);
    });

    it('should detect questions anywhere in the text', () => {
      const question = 'I have a question: what is this?';
      expect(controller.detectQuestion(question, true)).toBe(question);
    });
  });

  describe('detectCancelWord', () => {
    it('should detect single cancel word', () => {
      expect(controller.detectCancelWord('cancel this', 'cancel')).toBe(true);
      expect(controller.detectCancelWord('please cancel', 'cancel')).toBe(true);
    });

    it('should detect multiple comma-separated cancel words', () => {
      expect(controller.detectCancelWord('stop this', 'cancel, stop, abort')).toBe(true);
      expect(controller.detectCancelWord('abort now', 'cancel, stop, abort')).toBe(true);
      expect(controller.detectCancelWord('cancel it', 'cancel, stop, abort')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(controller.detectCancelWord('CANCEL', 'cancel')).toBe(true);
      expect(controller.detectCancelWord('Cancel', 'cancel')).toBe(true);
      expect(controller.detectCancelWord('CaNcEl', 'cancel')).toBe(true);
    });

    it('should handle whitespace in cancel word config', () => {
      expect(controller.detectCancelWord('stop', 'cancel , stop , abort')).toBe(true);
      expect(controller.detectCancelWord('abort', '  cancel,  stop,  abort  ')).toBe(true);
    });

    it('should return false for non-cancel words', () => {
      expect(controller.detectCancelWord('hello world', 'cancel')).toBe(false);
      expect(controller.detectCancelWord('continue please', 'cancel, stop')).toBe(false);
    });

    it('should return false for empty cancel word', () => {
      expect(controller.detectCancelWord('cancel', '')).toBe(false);
    });
  });

  describe('debouncing', () => {
    it('should allow navigation when debounce period has passed', () => {
      controller.resetDebounce();
      expect(controller.isDebounced()).toBe(false);
    });

    it('should block navigation within debounce period', () => {
      controller.recordNavigation();
      expect(controller.isDebounced()).toBe(true);
    });

    it('should allow navigation after debounce period', async () => {
      controller.recordNavigation();
      expect(controller.isDebounced()).toBe(true);

      // Wait for debounce period (2000ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 2100));
      expect(controller.isDebounced()).toBe(false);
    });

    it('should reset debounce timer', () => {
      controller.recordNavigation();
      expect(controller.isDebounced()).toBe(true);

      controller.resetDebounce();
      expect(controller.isDebounced()).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle a full navigation flow with debouncing', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      // First detection - should work
      controller.resetDebounce();
      expect(controller.isDebounced()).toBe(false);
      const result1 = controller.detectTriggerWords('this is a moment', section, 0);
      expect(result1).toBe(1);
      controller.recordNavigation();

      // Second detection immediately after - should be debounced
      expect(controller.isDebounced()).toBe(true);
      const result2 = controller.detectTriggerWords('another moment', section, 0);
      expect(result2).toBe(1); // Trigger is detected
      // But isDebounced() would prevent the action
    });

    it('should prioritize back command over trigger words', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'moment',
        selectedTriggers: ['moment'],
      };

      const transcript = 'go back to that moment';

      // In actual usage, back command check happens first
      const isBack = controller.detectBackCommand(transcript);
      const triggerResult = controller.detectTriggerWords(transcript, section, 1);

      expect(isBack).toBe(true);
      expect(triggerResult).toBe(2); // Both match, but back should take priority in app logic
    });

    it('should handle complex transcript with multiple potential triggers', () => {
      const section: Section = {
        id: '1',
        content: 'Test content',
        advanceToken: 'time',
        selectedTriggers: ['time', 'moment', 'opportunity'],
      };

      const transcript = 'now is the time for a great opportunity';

      const result = controller.detectTriggerWords(transcript, section, 0);
      expect(result).toBe(1); // Should match "time" first
    });
  });
});
