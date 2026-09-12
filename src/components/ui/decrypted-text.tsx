'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    className?: string;
    encryptedClassName?: string;
    parentClassName?: string;
    animateOn?: 'view' | 'hover' | 'both';
    [key: string]: any;
}

export function DecryptedText({
    text,
    speed = 45,
    maxIterations = 10,
    sequential = true,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+~`|}{[]:;?><,./-=',
    className = '',
    encryptedClassName = 'text-purple-400 opacity-80',
    parentClassName = '',
    animateOn = 'both',
    ...props
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [isScrambling, setIsScrambling] = useState(false);
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
    const containerRef = useRef<HTMLSpanElement>(null);

    const availableChars = useOriginalCharsOnly
        ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ')
        : characters.split('');

    const shuffleText = (originalText: string, currentRevealed: Set<number>) => {
        return originalText
            .split('')
            .map((char, i) => {
                if (char === ' ') return ' ';
                if (currentRevealed.has(i)) return originalText[i];
                return availableChars[Math.floor(Math.random() * availableChars.length)];
            })
            .join('');
    };

    const triggerAnimation = () => {
        if (isScrambling) return;
        setIsScrambling(true);
        let currentIteration = 0;
        const currentRevealed = new Set<number>();
        setRevealedIndices(new Set());

        const interval = setInterval(() => {
            if (sequential) {
                if (revealDirection === 'start') {
                    if (currentRevealed.size < text.length) {
                        currentRevealed.add(currentRevealed.size);
                    }
                } else if (revealDirection === 'end') {
                    if (currentRevealed.size < text.length) {
                        currentRevealed.add(text.length - 1 - currentRevealed.size);
                    }
                }
                setRevealedIndices(new Set(currentRevealed));
                setDisplayText(shuffleText(text, currentRevealed));

                if (currentRevealed.size >= text.length) {
                    clearInterval(interval);
                    setIsScrambling(false);
                    setDisplayText(text);
                }
            } else {
                setDisplayText(shuffleText(text, currentRevealed));
                currentIteration++;
                if (currentIteration >= maxIterations) {
                    clearInterval(interval);
                    setIsScrambling(false);
                    setDisplayText(text);
                }
            }
        }, speed);
    };

    useEffect(() => {
        if (animateOn === 'view' || animateOn === 'both') {
            triggerAnimation();
        }
    }, [text]);

    const handleMouseEnter = () => {
        if (animateOn === 'hover' || animateOn === 'both') {
            setIsHovering(true);
            triggerAnimation();
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    return (
        <span
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`inline-block whitespace-normal cursor-pointer select-none ${parentClassName}`}
            {...props}
        >
            <span className='sr-only'>{text}</span>
            <span aria-hidden='true'>
                {displayText.split('').map((char, index) => {
                    const isRevealed =
                        revealedIndices.has(index) || !isScrambling || char === ' ';
                    return (
                        <span
                            key={index}
                            className={isRevealed ? className : encryptedClassName}
                        >
                            {char}
                        </span>
                    );
                })}
            </span>
        </span>
    );
}
