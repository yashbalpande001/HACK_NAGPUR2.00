import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceReportButtonProps {
    onTranscript: (text: string) => void;
}

export const VoiceReportButton: React.FC<VoiceReportButtonProps> = ({ onTranscript }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
                setIsListening(false);
            };

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        } else {
            setIsSupported(false);
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`relative p-4 rounded-full transition-all duration-300 flex items-center justify-center ${isListening
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                    : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700'
                }`}
            title="Voice Report"
        >
            {isListening ? (
                <Mic className="w-6 h-6 animate-bounce" />
            ) : (
                <Mic className="w-6 h-6" />
            )}
            {isListening && (
                <span className="absolute -bottom-8 text-xs font-bold text-red-500 whitespace-nowrap">
                    Listening...
                </span>
            )}
        </button>
    );
};
