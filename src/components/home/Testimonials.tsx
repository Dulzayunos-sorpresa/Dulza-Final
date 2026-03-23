import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    { name: 'María García', text: 'El desayuno fue increíble, la presentación impecable y todo riquísimo. ¡Súper recomendable!', rating: 5, date: 'Hace 2 días' },
    { name: 'Juan Pérez', text: 'Excelente atención y puntualidad. El regalo llegó perfecto y a mi novia le encantó.', rating: 5, date: 'Hace 1 semana' },
    { name: 'Ana Rodríguez', text: 'Lo mejor que he probado en desayunos artesanales. Se nota el amor en cada detalle.', rating: 5, date: 'Hace 3 días' },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-stone-50/50 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif text-stone-900 mb-8"
          >
            Lo que dicen <span className="text-brand-500 italic">nuestros</span> clientes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-500 max-w-2xl mx-auto"
          >
            Nuestra mayor satisfacción es ser parte de tus momentos especiales.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-stone-50 p-12 rounded-[3rem] relative group hover:bg-white hover:shadow-2xl hover:shadow-stone-100 transition-all duration-500"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-stone-200 group-hover:text-brand-100 transition-colors" />
              
              <div className="flex gap-1 mb-8">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-500 text-brand-500" />
                ))}
              </div>
              
              <p className="text-xl text-stone-700 mb-10 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-bold text-stone-900">{testimonial.name}</p>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{testimonial.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Testimonials);
