import React from 'react';
import { motion } from 'framer-motion';

const Moments = () => {
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
    <section className="px-6 md:px-20 py-32 bg-crema dark:bg-dark-bg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rosa-suave/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-naranja/5 rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-naranja font-bold mb-6">Para cada momento</p>
            <h2 className="text-5xl md:text-7xl font-display text-texto dark:text-dark-text leading-[0.9] mb-8 uppercase tracking-tighter">
              Hay un Dulzayunos<br />para <span className="text-naranja italic">eso.</span>
            </h2>
            <p className="text-base md:text-lg text-texto/70 dark:text-dark-text-muted leading-relaxed max-w-xl font-light">
              Sin importar la razón — o sin razón alguna — hay una forma de hacer que mañana a la mañana alguien se sienta la persona más querida del mundo.
            </p>
          </motion.div>
          <div className="hidden md:block">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border border-naranja/20 flex items-center justify-center text-naranja"
            >
              <span className="text-2xl">✦</span>
            </motion.div>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {moments.map((moment, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -10, boxShadow: "0 30px 60px -15px rgba(242,125,38,0.1)" }}
              className="group relative bg-white dark:bg-dark-surface rounded-[40px] p-10 transition-all duration-500 border border-naranja/5 dark:border-white/5"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-crema dark:bg-dark-bg rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform duration-500"
              >
                {moment.icon}
              </motion.div>
              <h3 className="text-2xl font-display text-texto dark:text-dark-text mb-4 uppercase tracking-tight">{moment.title}</h3>
              <div className="space-y-6">
                <p className="text-sm text-texto/60 dark:text-dark-text-muted/60 italic leading-relaxed border-l-2 border-naranja/30 pl-6 py-1">
                  "{moment.quote}"
                </p>
                <p className="text-sm text-texto dark:text-dark-text font-bold leading-relaxed flex items-start gap-3">
                  <span className="text-naranja mt-1">→</span>
                  {moment.hook}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Moments;
