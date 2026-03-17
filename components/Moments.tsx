import React from 'react';

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

  return (
    <section className="px-6 md:px-20 py-24 bg-blanco">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-4">Para cada momento</p>
        <h2 className="text-4xl md:text-5xl font-display text-cafe leading-[1.15] mb-6">
          Hay un Dulzayunos<br />para <span className="text-tostado italic">eso.</span>
        </h2>
        <p className="text-sm md:text-base text-gris-calido leading-relaxed max-w-lg mb-16 font-light">
          Sin importar la razón — o sin razón alguna — hay una forma de hacer que mañana a la mañana alguien se sienta la persona más querida del mundo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moments.map((moment, i) => (
            <div key={i} className="group relative bg-crema rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cafe/10 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-tostado scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <span className="text-4xl mb-6 block">{moment.icon}</span>
              <h3 className="text-xl font-display text-cafe mb-3">{moment.title}</h3>
              <p className="text-xs text-gris-calido italic leading-relaxed border-l-2 border-tostado pl-4 mb-4">
                "{moment.quote}"
              </p>
              <p className="text-xs text-cafe-medio font-bold leading-relaxed">
                {moment.hook}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Moments;
