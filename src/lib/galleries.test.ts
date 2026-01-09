
import { describe, it, expect } from 'vitest';
import { isHiddenGalleryName, type Gallery } from './galleries';

describe('Galleries Logic', () => {
    describe('isHiddenGalleryName', () => {
        it('should identify "general" as a hidden gallery', () => {
            expect(isHiddenGalleryName('general')).toBe(true);
        });

        it('should identify "GENERAL" (case insensitive) as a hidden gallery', () => {
            expect(isHiddenGalleryName('GENERAL')).toBe(true);
        });

        it('should identify " general " (whitespace) as a hidden gallery', () => {
            expect(isHiddenGalleryName(' general ')).toBe(true);
        });

        it('should NOT identify "Nature" as a hidden gallery', () => {
            expect(isHiddenGalleryName('Nature')).toBe(false);
        });

        it('should NOT identify "General Store" as a hidden gallery', () => {
            expect(isHiddenGalleryName('General Store')).toBe(false);
        });
    });
});
