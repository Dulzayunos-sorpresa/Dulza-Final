import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      icon: "🎁",
      title: "Elegís tu desayuno",
      desc: "Seleccionás el combo que más representa lo que querés decir. Cada producto es artesanal y pensado para que se note."
    },
    {
      num: "02",
      icon: "💌",
      title: "Personalizás el mensaje",
      desc: "Escribís las palabras que querés que lleguen junto con el desayuno. O si no sabés qué decir, te ayudamos."
    },
    {
      num: "03",
      icon: "📦",
      title: "Nosotros lo armamos",
      desc: "Cada pedido se arma con cuidado esa misma noche. No es un paquete genérico — es una experiencia que se nota."
    },
    {
      num: "04",
      icon: "🚪",
      title: "Llega a la mañana",
      desc: "A primera hora del día. En la puerta. Cuando todavía no espera nada. Ese momento es el regalo."
    }
  ];

  return (
    <section className="px-6 md:px-20 py-24 bg-cafe text-crema">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-4">El proceso</p>
        <h2 className="text-4xl md:text-5xl font-display text-crema leading-[1.15] mb-6">
          De cero a sorpresa<br /><span className="text-tostado italic">en minutos.</span>
        </h2>
        <p className="text-sm md:text-base text-crema/50 leading-relaxed max-w-lg mb-16 font-light">
          No hace falta planificarlo con días de anticipación. Si pedís antes de medianoche, llegamos mañana a la mañana.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="font-display text-7xl font-bold text-tostado/20 leading-none mb-4">
                {step.num}
              </div>
              <span className="text-3xl mb-4 block">{step.icon}</span>
              <h3 className="text-lg font-bold text-crema mb-3">{step.title}</h3>
              <p className="text-sm text-crema/50 leading-relaxed">
                {step.desc}
              </p>
              {i < 3 && (
                <span className="hidden lg:block absolute top-10 -right-6 text-tostado/40 text-2xl">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
