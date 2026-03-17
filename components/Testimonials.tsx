import React from 'react';

const Testimonials = () => {
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

  return (
    <section className="px-6 md:px-20 py-24 bg-crema">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-4">Lo que dice la gente</p>
        <h2 className="text-4xl md:text-5xl font-display text-cafe leading-[1.15] mb-6">
          La prueba la da<br /><span className="text-tostado italic">el receptor.</span>
        </h2>
        <p className="text-sm md:text-base text-gris-calido leading-relaxed max-w-lg mb-16 font-light">
          No tenemos que explicar por qué funciona. Lo hacen ellos solos cuando abren la puerta.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${review.featured ? 'bg-tostado text-white' : 'bg-white text-cafe'}`}
            >
              <div className={`text-sm mb-4 tracking-[2px] ${review.featured ? 'text-white/80' : 'text-dorado'}`}>
                {review.stars}
              </div>
              <p className={`text-base font-display italic leading-relaxed mb-8 ${review.featured ? 'text-white' : 'text-cafe'}`}>
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${review.featured ? 'bg-white/20' : 'bg-crema'}`}>
                  {review.icon}
                </div>
                <div>
                  <div className={`text-sm font-bold ${review.featured ? 'text-white' : 'text-cafe'}`}>{review.author}</div>
                  <div className={`text-[10px] uppercase tracking-wider ${review.featured ? 'text-white/60' : 'text-gris-calido'}`}>{review.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
