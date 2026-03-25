import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const GeoStripes = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
     <path d="M-20 20L20 -20L40 -20L-20 40Z" />
     <path d="M0 100L100 0L120 0L0 120Z" />
     <path d="M40 100L100 40L120 40L40 120Z" />
     <path d="M-10 60L60 -10L80 -10L-10 80Z" />
     <path d="M80 100L100 80L120 80L80 120Z" />
  </svg>
);

const About: React.FC = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const reviews = [
    {
      id: 1,
      name: "Fausto",
      text: "Excelente calidad y atención muy personalizada! Le pedí un Desayuno a mi hermano y le llegó perfecto, muchísimas gracias!",
      date: "Hace 5 semanas",
      stars: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      name: "Nadia Gonzalez",
      text: "Lo recomiendo muchísimo, estamos fuera del país y quisimos dar la sorpresa a nuestras familias y amigos de nuestro primer bebé en camino, gracias a ellos pudimos hacer exacto lo que nos imaginamos.",
      date: "Hace 3 meses",
      stars: 5,
      image: "https://lh3.googleusercontent.com/a-/ALV-UjUJUwPin6qc7t6XlHYuIzj8AqUL0cU1uX7V7YryJF4fbSg5RW8=w36-h36-p-rp-mo-br100"
    },
    {
      id: 3,
      name: "Wanda Belen",
      text: "Les encargue en varias oportunidades y siempre excelente todo! La calidad de los productos, los detalles, el servicio. Súper recomiendo!!!",
      date: "Hace 5 días",
      stars: 5,
      image: "https://lh3.googleusercontent.com/a-/ALV-UjVa6tV9kSjlY5cz1_Ft5gA2Rs2vc3I89KE3s7LsM32UY5xFj5Xu0Q=w36-h36-p-rp-mo-br100"
    },
    {
      id: 4,
      name: "Maria Romina",
      text: "El servicio que ofrecen es espectacular!! Hace varios años que solicito desayunos, meriendas o picadas y son todas excepcionales!",
      date: "Hace 2 días",
      stars: 5,
      image: "https://lh3.googleusercontent.com/a-/ALV-UjWSiTL25qKFTNjSSrVohIRk7hEGKr0URpTk4uzQBM3k1EqIwMyuXw=w36-h36-p-rp-mo-br100"
    }
  ];

  return (
    <div className={`${theme.bg} min-h-screen animate-fade-in overflow-hidden`}>
      {/* Hero Section */}
      <section className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-pattern"></div>

        <div className="flex flex-col justify-center px-6 md:px-20 py-20 relative z-10">
          <p className={`text-[10px] tracking-[2.5px] uppercase ${theme.primary} font-bold mb-6 animate-fade-up`}>
            {theme.emoji} Nuestra Historia
          </p>
          <h1 className={`text-5xl md:text-7xl font-display ${theme.text} leading-[1.08] mb-8 animate-fade-up delay-100`}>
            Regalamos <br />
            <span className={`${theme.primary} italic`}>emociones,</span> <br />
            no solo desayunos.
          </h1>
          <p className={`text-lg ${theme.text} opacity-70 leading-relaxed max-w-lg mb-12 font-light animate-fade-up delay-200`}>
            {uiContent.about_text}
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
            <Link 
              to="/"
              className={`${theme.secondary} text-white px-10 py-4 rounded-full text-sm font-bold shadow-2xl shadow-brand-200 hover:opacity-90 transition-all transform hover:-translate-y-1`}
            >
              Ver catálogo
            </Link>
          </div>
        </div>

        <div className={`relative flex items-center justify-center ${theme.heroBg} overflow-hidden min-h-[500px]`}>
          <div className="absolute inset-0 opacity-20">
             <GeoStripes className={`w-full h-full ${theme.primary}`} />
          </div>
          <div className="relative z-10 animate-scale-in delay-200">
            <div className="w-[320px] bg-white rounded-[32px] p-8 shadow-2xl relative">
              <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1513442542250-854d436a73f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Equipo de Dulzayunos" 
                  loading="lazy"
                  width="320"
                  height="320"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className={`text-[10px] ${theme.primary} font-bold uppercase tracking-widest mb-2`}>Desde 2018</p>
                <p className={`font-display italic ${theme.text} text-lg`}>"Hecho con amor en Córdoba"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <div className="py-32 bg-white dark:bg-dark-surface relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="mb-20 animate-fade-up">
            <p className={`text-[10px] tracking-[2.5px] uppercase ${theme.primary} font-bold mb-4`}>Por qué nos eligen</p>
            <h2 className={`text-4xl md:text-5xl font-display ${theme.text} dark:text-dark-text leading-[1.15]`}>
              Nuestros <span className={`${theme.primary} italic`}>Valores.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'Calidad Artesanal',
                description: 'Nuestros productos de panadería y pastelería se elaboran diariamente con ingredientes frescos y seleccionados, priorizando el sabor y la excelencia.',
                icon: '🥐',
              },
              {
                title: 'Pasión por los Detalles',
                description: 'Desde la elección del packaging hasta el moño y la tarjeta personalizada, cuidamos cada aspecto visual para que la experiencia sea memorable.',
                icon: '✨',
              },
              {
                title: 'Atención Personalizada',
                description: 'Acompañamos a cada cliente en el proceso de elección para asegurarnos de que el regalo represente exactamente lo que quiere transmitir.',
                icon: '🙋',
              },
              {
                title: 'Hecho con Compromiso',
                description: 'Somos una empresa familiar que entiende el valor emocional de cada entrega. Sabemos que no es “un pedido más”: es un gesto importante.',
                icon: '❤️',
              },
            ].map((feature, idx) => (
              <div key={feature.title} className="flex gap-8 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`w-16 h-16 rounded-3xl ${theme.heroBg} flex items-center justify-center text-3xl shrink-0 shadow-sm`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-display ${theme.text} dark:text-dark-text mb-3`}>{feature.title}</h3>
                  <p className={`${theme.text} opacity-70 dark:text-dark-text-muted leading-relaxed font-light text-sm`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={`py-32 ${theme.heroBg}/30`}>
         <div className="max-w-7xl mx-auto px-6 md:px-20">
            <div className="text-center mb-20 animate-fade-up">
               <p className={`text-[10px] tracking-[2.5px] uppercase ${theme.primary} font-bold mb-4`}>Clientes Felices</p>
               <h2 className={`text-4xl md:text-5xl font-display ${theme.text} mb-8`}>Lo que dicen de <span className={`${theme.primary} italic`}>nosotros.</span></h2>
               <div className="flex flex-col items-center justify-center gap-6">
                   <div className={`bg-white px-8 py-4 rounded-full shadow-2xl shadow-brand-500/10 flex items-center gap-4 border border-brand-500/5`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Logo de Google" className="w-6 h-6" width="24" height="24" loading="lazy" />
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${theme.text} text-lg`}>4.9/5</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`h-4 w-4 fill-brand-500 ${theme.primary}`} />
                            ))}
                          </div>
                        </div>
                        <span className={`text-[10px] ${theme.text} opacity-60 uppercase tracking-widest font-bold`}>120+ reseñas en Google</span>
                      </div>
                   </div>
                   
                   <a 
                     href="https://www.google.com/maps/place/Dulzayunos+Desayunos+Sorpresa/@-31.4086471,-64.1949173,645m/data=!3m1!1e3!4m8!3m7!1s0x94329887584e4a73:0xfc168a7c46cdfb3f!8m2!3d-31.4086471!4d-64.1949173!9m1!1b1!16s%2Fg%2F11c0tjhdft?entry=ttu&g_ep=EgoyMDI2MDEyNS4wIKXMDSoASAFQAw%3D%3D" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className={`${theme.primary} hover:opacity-80 font-bold text-sm flex items-center gap-2 transition-colors`}
                   >
                     Ver todas las reseñas <ExternalLink className="w-4 h-4" />
                   </a>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {reviews.map((review, idx) => (
                  <div key={review.id} className={`bg-white rounded-[32px] p-8 shadow-xl shadow-brand-500/5 animate-fade-up flex flex-col h-full border border-brand-500/5`} style={{ animationDelay: `${idx * 100}ms` }}>
                     <div className="flex items-center gap-4 mb-6">
                        {review.image ? (
                            <img src={review.image} alt={`Foto de ${review.name}`} className="w-12 h-12 rounded-full object-cover shadow-sm" width="48" height="48" loading="lazy" decoding="async" />
                        ) : (
                            <div className={`w-12 h-12 rounded-full ${theme.heroBg} flex items-center justify-center ${theme.primary} font-bold text-xl`}>
                                {review.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <span className={`font-display ${theme.text} block leading-tight`}>{review.name}</span>
                            <span className={`text-[10px] ${theme.text} opacity-40 uppercase tracking-wider font-bold`}>{review.date}</span>
                        </div>
                     </div>
                     <div className="flex gap-0.5 mb-4">
                        {[...Array(review.stars)].map((_, i) => (
                           <Star key={i} className={`h-3 w-3 fill-brand-500 ${theme.primary}`} />
                        ))}
                     </div>
                     <p className={`${theme.text} opacity-70 text-sm leading-relaxed flex-1 font-light italic`}>"{review.text}"</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;
