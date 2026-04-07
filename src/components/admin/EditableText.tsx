import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useStore } from '@/context/store';
import { motion, AnimatePresence } from 'motion/react';

interface EditableTextProps {
  contentKey: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  contentKey, 
  className = '', 
  as: Component = 'span',
  multiline = false
}) => {
  const { uiContent, updateUIContent, isAdmin } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(uiContent[contentKey] || '');

  useEffect(() => {
    setValue(uiContent[contentKey] || '');
  }, [uiContent, contentKey]);

  if (!isAdmin) {
    return <Component className={className}>{uiContent[contentKey]}</Component>;
  }

  const handleSave = async () => {
    try {
      await updateUIContent({
        ...uiContent,
        [contentKey]: value
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating UI content:', error);
    }
  };

  const handleCancel = () => {
    setValue(uiContent[contentKey] || '');
    setIsEditing(false);
  };

  return (
    <span className="group relative inline-block w-full">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.span 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex flex-col gap-2 w-full"
          >
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-dark-surface text-texto dark:text-dark-text min-h-[100px]"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-dark-surface text-texto dark:text-dark-text"
                autoFocus
              />
            )}
            <span className="flex gap-2 justify-end">
              <button 
                onClick={handleSave}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={handleCancel}
                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </span>
          </motion.span>
        ) : (
          <span className="flex items-start gap-2 group/text">
            <Component className={className}>{uiContent[contentKey]}</Component>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover/text:opacity-100 p-1 text-brand-500 hover:bg-brand-50 rounded transition-all shrink-0"
              title="Editar texto"
            >
              <Edit2 size={14} />
            </button>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
};
