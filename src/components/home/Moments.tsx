import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const Moments = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);

  const moments = [
    {
      icon: "🎂",
      title: "Cumpleaños de último momento",
      quote: "Me olvidé del cumple, necesito algo hoy que llegue esta mañana.",
      hook: "Hoy es su cumpleaños. Todavía llegás. 📦"
    },
    {
      icon: "🌅",
      title: "El mimo sin razón",
      quote: "Tuvo una semana muy dura, quiero hacerla sentir especial.",
      hook: "No hace falta un cumpleaños. El martes también merece una sorpresa. 🌅"
    },
    {
      icon: "💑",
      title: "Relaciones largas",
      quote: "Llevamos años juntos y quiero que siga sintiendo mariposas.",
      hook: "10 años juntos y todavía puedo sorprenderte. 🥹"
    },
    {
      icon: "🥐",
      title: "Pedir perdón sin palabras",
      quote: "La embarré y no sé cómo pedirle perdón.",
      hook: "A veces no hay palabras. Pero sí hay medialunas. 🥐"
    },
    {
      icon: "📍",
      title: "Cuando no podés estar",
      quote: "Vivo lejos y siento que me quedo afuera de los momentos importantes.",
      hook: "No puedo estar. Pero sí puedo asegurarme de que empiece el día sintiéndose querida."
    },
    {
      icon: "🏆",
      title: "Quedar como el mejor",
      quote: "Quiero que lo postee en sus stories y me etiquete.",
      hook: "Quedar como el mejor regalo del año no requiere gran presupuesto. Solo saber dónde pedir. 🎯"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className={`px-6 md:px-20 py-32 ${theme.heroBg}/30 dark:bg-dark-bg relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${theme.heroBg} opacity-20 rounded-full blur-3xl -mr-32 -mt-32`} />
      <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme.heroBg} opacity-10 rounded-full blur-3xl -ml-48 -mb-48`} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className={`text-[10px] md:text-xs uppercase tracking-[0.3em] ${theme.primary} font-bold mb-6`}>Para cada momento</p>
            <h2 className="text-5xl md:text-7xl font-display text-texto dark:text-dark-text leading-[0.9] mb-8 uppercase tracking-tighter">
              {uiContent.moments_title || 'Para cada'}
              <br />
              <span className={`${theme.primary} italic`}>
                {uiContent.moments_subtitle || 'momento'}
              </span>
            </h2>
            <p className="text-base md:text-lg text-texto/70 dark:text-dark-text-muted leading-relaxed max-w-xl font-light">
              {uiContent.moments_description || 'Nuestros desayunos están pensados para acompañar cada historia.'}
            </p>
          </motion.div>
          <div className="hidden md:block">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`w-24 h-24 rounded-full border border-brand-100/20 flex items-center justify-center ${theme.primary}`}
            >
              <span className="text-2xl">✦</span>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {moments.map((moment, i) => (
            <div 
              key={i} 
              className={`group relative bg-white dark:bg-dark-surface rounded-[40px] p-10 transition-all duration-500 border border-brand-100/5 dark:border-white/5 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2`}
            >
              <div className="w-16 h-16 bg-crema dark:bg-dark-bg rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {moment.icon}
              </div>
              <h3 className="text-2xl font-display text-texto dark:text-dark-text mb-4 uppercase tracking-tight">{moment.title}</h3>
              <div className="space-y-6">
                <p className={`text-sm text-texto/60 dark:text-dark-text-muted/60 italic leading-relaxed border-l-2 ${theme.primary} opacity-30 pl-6 py-1`}>
                  "{moment.quote}"
                </p>
                <p className="text-sm text-texto dark:text-dark-text font-bold leading-relaxed flex items-start gap-3">
                  <span className={`${theme.primary} mt-1`}>→</span>
                  {moment.hook}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Moments;
