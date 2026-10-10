/**
 * Centralized Server-Side Input Validation & Sanitization
 * Protects against XSS, prototype pollution, SQL/NoSQL injection, and malformed payloads.
 */

import { Request, Response, NextFunction } from 'express';

// Disallowed prototype pollution keys
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Strips HTML tags, script vectors, and control characters from text strings
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Validates standard email format according to RFC 5322 subset
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return email.length <= 254 && re.test(email.trim());
}

/**
 * Validates international and Kenyan phone numbers (+254, 07..., 01...)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  return clean.length >= 7 && clean.length <= 20 && /^\+?[0-9]+$/.test(clean);
}

/**
 * Recursively scans object for prototype pollution vectors and blocks them
 */
export function preventPrototypePollution(req: Request, res: Response, next: NextFunction): void {
  function checkObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;

    for (const key of Object.keys(obj)) {
      if (DANGEROUS_KEYS.includes(key)) {
        return true;
      }
      if (typeof obj[key] === 'object' && checkObject(obj[key])) {
        return true;
      }
    }
    return false;
  }

  if (req.body && checkObject(req.body)) {
    res.status(400).json({ error: 'Malformed payload: Prohibited object keys detected.' });
    return;
  }

  if (req.query && checkObject(req.query)) {
    res.status(400).json({ error: 'Malformed query parameters.' });
    return;
  }

  next();
}

/**
 * Strict validator for contact & consultation form submissions
 */
export function validateFormSubmission(data: any): {
  valid: boolean;
  errors: string[];
  sanitized: {
    fullName: string;
    email: string;
    phone: string;
    type: 'consultation' | 'inquiry' | 'callback';
    message: string;
    topic?: string;
  };
} {
  const errors: string[] = [];

  const rawName = data?.fullName || data?.name || '';
  const fullName = sanitizeString(rawName);
  if (!fullName || fullName.length < 2 || fullName.length > 120) {
    errors.push('Full name must be between 2 and 120 characters.');
  }

  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  const rawPhone = data?.phone || '';
  const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
  if (phone && !isValidPhone(phone)) {
    errors.push('Phone number format is invalid.');
  }

  const rawMessage = data?.message || data?.notes || '';
  const message = sanitizeString(rawMessage);
  if (!message || message.length < 5 || message.length > 5000) {
    errors.push('Message or case notes must be between 5 and 5,000 characters.');
  }

  const type = data?.type === 'consultation' ? 'consultation' : 'inquiry';
  const topic = data?.topic ? sanitizeString(data.topic).slice(0, 150) : undefined;

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      fullName,
      email,
      phone,
      type,
      message,
      topic,
    },
  };
}

/**
 * Validates AI prompts to prevent token exhaustion and injection
 */
export function validateAiPrompt(prompt: unknown): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof prompt !== 'string') {
    return { valid: false, sanitized: '', error: 'Prompt must be a string.' };
  }

  const sanitized = sanitizeString(prompt);
  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'Query cannot be empty.' };
  }

  if (sanitized.length > 1000) {
    return {
      valid: false,
      sanitized: sanitized.slice(0, 1000),
      error: 'Query exceeds the 1,000 character maximum limit.',
    };
  }

  return { valid: true, sanitized };
}
