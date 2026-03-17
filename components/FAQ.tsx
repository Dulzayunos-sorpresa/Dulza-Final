import React, { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Hasta qué hora puedo pedir para que llegue mañana?",
      a: "Podés pedir hasta las 23:59 de hoy y el desayuno llega mañana antes de las 10am. Para zonas del GBA el límite es las 22hs."
    },
    {
      q: "¿En qué zonas entregan?",
      a: "Cubrimos toda la Ciudad de Buenos Aires y el primer y segundo cordón del GBA. Si tenés dudas sobre una dirección específica, escribinos por Instagram."
    },
    {
      q: "¿Puedo agregar un mensaje personalizado?",
      a: "Sí, siempre. Al momento de hacer el pedido podés escribir lo que querés que diga la tarjeta. Si no sabés qué poner, te tiramos ideas."
    },
    {
      q: "¿Qué pasa si el receptor no está en casa?",
      a: "Te avisamos antes de llegar. Si no podemos entregar, coordinamos un segundo intento o te devolvemos el dinero. Ninguna sorpresa se pierde."
    },
    {
      q: "¿Los productos son realmente artesanales?",
      a: "Sí. Las medialunas se hacen esa misma mañana. Las tablas se arman con productos seleccionados de productores locales. Nada es industrial."
    },
    {
      q: "¿Puedo pedir sin una fecha especial?",
      a: "Eso es lo que más nos gusta. El 40% de nuestros pedidos no tienen ninguna fecha especial — solo alguien que quiso sorprender. El martes también merece un desayuno sorpresa."
    }
  ];

  return (
    <section className="px-6 md:px-20 py-24 bg-blanco">
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-4">Preguntas frecuentes</p>
        <h2 className="text-4xl md:text-5xl font-display text-cafe leading-[1.15] mb-12">
          Todo lo que necesitás<br /><span className="text-tostado italic">saber.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 ${openIndex === i ? 'bg-white shadow-xl shadow-cafe/5 ring-1 ring-tostado/10' : 'bg-crema hover:bg-white hover:shadow-lg'}`}
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className="text-sm font-bold text-cafe">{faq.q}</h3>
                <span className={`text-tostado text-2xl transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openIndex === i && (
                <p className="text-sm text-gris-calido leading-relaxed mt-4 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
