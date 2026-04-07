import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const Testimonials = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);

  const reviews = [
    {
      stars: "★★★★★",
      text: "Quedé como el marido del año. Mi señora no paraba de llorar. Dijo exactamente eso: 'se nota que lo pensaste'. No lo puedo creer.",
      author: "Matías R.",
      detail: "Aniversario · Nva. Cordoba",
      icon: "👨"
    },
    {
      stars: "★★★★★",
      text: "Era un martes al azar. Sin fecha especial. Y fue el mejor desayuno de mi vida. Mi amiga es la más detallista del mundo.",
      author: "Valentina S.",
      detail: "Recibió la sorpresa · Centro",
      icon: "👩",
      featured: true
    },
    {
      stars: "★★★★★",
      text: "Me acordé a la noche del cumple de mi mamá y pedí a las 11pm. A las 9am ella ya estaba llorando de emoción. Servicio increíble.",
      author: "Lucía P.",
      detail: "Cumpleaños de último momento · Villa Allende",
      icon: "🙋"
    },
    {
      stars: "★★★★★",
      text: "Vivo en Córdoba y mandé el desayuno a mi abuela en Buenos Aires. Me llamó llorando. Fue como estar presente sin estar.",
      author: "Tomás G.",
      detail: "Regalo a distancia · Córdoba",
      icon: "🧑"
    },
    {
      stars: "★★★★★",
      text: "Llevamos 8 años y creía que ya no podía sorprenderla. Este desayuno fue la primera vez en años que me dijo 'no me lo esperaba'.",
      author: "Nicolás F.",
      detail: "Pareja larga · Alta Cba",
      icon: "😊"
    },
    {
      stars: "★★★★★",
      text: "Lo posté en stories y me etiquetó. Después de eso me escribieron 5 amigas preguntando dónde lo había pedido. Se re nota.",
      author: "Caro M.",
      detail: "Regalo creativo · Barrio Jardin",
      icon: "💁"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <section className="px-6 md:px-20 py-32 bg-white dark:bg-dark-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-24"
        >
          <p className={`text-[10px] md:text-xs uppercase tracking-[0.3em] ${theme.primary} font-bold mb-6`}>Lo que dice la gente</p>
          <h2 className="text-5xl md:text-7xl font-display text-texto dark:text-dark-text leading-[0.9] mb-8 uppercase tracking-tighter">
            {uiContent.testimonials_title || 'Historias'}
            <br />
            <span className={`${theme.primary} italic`}>
              {uiContent.testimonials_subtitle || 'reales'}
            </span>
          </h2>
          <p className="text-base md:text-lg text-texto/60 dark:text-dark-text-muted leading-relaxed max-w-xl font-light">
            {uiContent.testimonials_description || 'Lo que más nos importa es el momento que logramos crear.'}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {reviews.map((review, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`p-10 rounded-[40px] transition-all duration-500 border ${
                review.featured 
                ? 'bg-texto dark:bg-dark-surface text-crema dark:text-dark-text border-texto dark:border-white/5 shadow-[0_30px_60px_-15px_rgba(20,20,20,0.2)]' 
                : `${theme.heroBg}/30 dark:bg-dark-surface/30 text-texto dark:text-dark-text border-brand-100/5 dark:border-white/5 hover:${theme.heroBg}/50 dark:hover:bg-dark-surface/50`
              }`}
            >
              <div className={`flex gap-1 mb-8 ${review.featured ? theme.primary : `${theme.primary} opacity-60`}`}>
                {[...Array(5)].map((_, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="text-xs"
                  >
                    ✦
                  </motion.span>
                ))}
              </div>
              <p className={`text-lg font-display italic leading-relaxed mb-10 ${review.featured ? 'text-crema dark:text-dark-text' : 'text-texto dark:text-dark-text'}`}>
                "{review.text}"
              </p>
              <div className="flex items-center gap-5">
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${review.featured ? 'bg-crema/10 dark:bg-white/10' : 'bg-white dark:bg-dark-bg shadow-sm'}`}
                >
                  {review.icon}
                </motion.div>
                <div>
                  <div className={`text-sm font-bold uppercase tracking-tight ${review.featured ? 'text-crema dark:text-dark-text' : 'text-texto dark:text-dark-text'}`}>{review.author}</div>
                  <div className={`text-[10px] uppercase tracking-[0.15em] font-medium ${review.featured ? 'text-crema/40' : 'text-texto/40 dark:text-dark-text-muted/40'}`}>{review.detail}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
