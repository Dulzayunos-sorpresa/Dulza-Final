import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: '¿Con cuánta anticipación debo pedir?', answer: 'Recomendamos realizar tu pedido con al menos 48 horas de anticipación para asegurar disponibilidad, especialmente en fechas especiales.' },
    { question: '¿Hacen envíos a domicilio?', answer: 'Sí, realizamos envíos en toda la ciudad y zonas aledañas. El costo se calcula según la distancia.' },
    { question: '¿Puedo personalizar mi regalo?', answer: '¡Absolutamente! Podés agregar mensajes, elegir colores y sumar adicionales a cualquiera de nuestros Dulzayunos.' },
    { question: '¿Qué medios de pago aceptan?', answer: 'Aceptamos transferencias bancarias, Mercado Pago y efectivo al momento de la entrega.' },
  ];

  return (
    <section className="py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif text-stone-900 mb-8"
          >
            Preguntas <span className="text-brand-500 italic">frecuentes</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-500 max-w-2xl mx-auto"
          >
            Todo lo que necesitás saber para que tu experiencia sea perfecta.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200 transition-all duration-500"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-10 py-8 flex items-center justify-between text-left group"
              >
                <span className="text-xl font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                  {faq.question}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${openIndex === index ? 'bg-brand-500 text-white rotate-180' : 'bg-stone-50 text-stone-400'}`}>
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-10 pb-10 text-stone-500 text-lg leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(FAQ);
