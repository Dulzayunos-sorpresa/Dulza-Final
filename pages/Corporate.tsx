import React, { useState } from 'react';
import { Building2, Gift, Truck, Users, Send, CheckCircle } from 'lucide-react';

const Corporate: React.FC = () => {
  const [formState, setFormState] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.company.trim()) newErrors.company = 'Empresa obligatoria';
    if (!formState.name.trim()) newErrors.name = 'Nombre obligatorio';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      newErrors.email = 'Email obligatorio';
    } else if (!emailRegex.test(formState.email)) {
      newErrors.email = 'Email inválido';
    }

    const phoneRegex = /^\d{10,15}$/;
    if (formState.phone && !phoneRegex.test(formState.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Teléfono inválido (10-15 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { company, name, email, phone, quantity, message } = formState;

    const whatsappMessage = `Hola! Vengo desde la web, sección Empresas 🏢\n\n` +
      `*Empresa:* ${company}\n` +
      `*Contacto:* ${name}\n` +
      `*Email:* ${email}\n` +
      `*Teléfono:* ${phone}\n` +
      `*Cantidad:* ${quantity}\n` +
      `*Mensaje:* ${message}`;

    const phoneNumber = "5493512261245";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.location.href = url;
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-brand-50 min-h-screen animate-fade-in">
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-600/20 text-brand-400 text-sm font-bold mb-4 border border-brand-500/30">
            SOLUCIONES CORPORATIVAS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Regalos que Fortalecen Vínculos
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-8">
            Celebra logros, aniversarios y fechas especiales con desayunos y presentes personalizados para tu equipo y clientes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-brand-100 rounded-full mb-6">
              <Gift className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Propuestas a Medida</h3>
            <p className="text-stone-600">
              Adaptamos el contenido y el presupuesto a las necesidades de tu empresa. Desde desayunos box hasta kits de bienvenida.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-brand-100 rounded-full mb-6">
              <Building2 className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Branding Corporativo</h3>
            <p className="text-stone-600">
              Personalizamos tazas, tarjetas y packaging con el logo y los colores de tu marca para lograr un impacto memorable.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-brand-100 rounded-full mb-6">
              <Truck className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Logística Integral</h3>
            <p className="text-stone-600">
              Nos encargamos de la coordinación y entrega en múltiples domicilios en Córdoba Capital y alrededores.
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-8 lg:p-12 bg-brand-600 text-white flex flex-col justify-center">
            <h2 className="text-3xl font-display font-bold mb-6">¿Tenés una propuesta en mente?</h2>
            <p className="text-brand-100 text-lg mb-8 leading-relaxed">
              Dejanos tus datos y un asesor comercial se pondrá en contacto con vos para diseñar juntos la mejor opción para tu empresa.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-500 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Atención personalizada</p>
                  <p className="text-brand-100 text-sm">Acompañamiento de principio a fin</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-500 rounded-lg">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Factura C</p>
                  <p className="text-brand-100 text-sm">Disponibilidad de facturación fiscal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">¡Mensaje Enviado!</h3>
                <p className="text-stone-500">
                  Gracias por contactarnos. Te responderemos a la brevedad con una propuesta.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-600 font-bold hover:underline"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Empresa</label>
                    <input 
                      type="text" 
                      name="company"
                      required
                      className={`w-full px-4 py-3 border ${errors.company ? 'border-red-500' : 'border-stone-200'} rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                      placeholder="Nombre de la empresa"
                      onChange={(e) => {
                        handleChange(e);
                        if (errors.company) setErrors({...errors, company: ''});
                      }}
                    />
                    {errors.company && <p className="text-[10px] text-red-500 mt-1">{errors.company}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Contacto</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-stone-200'} rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                      placeholder="Tu nombre"
                      onChange={(e) => {
                        handleChange(e);
                        if (errors.name) setErrors({...errors, name: ''});
                      }}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-stone-200'} rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                      placeholder="email@empresa.com"
                      onChange={(e) => {
                        handleChange(e);
                        if (errors.email) setErrors({...errors, email: ''});
                      }}
                    />
                    {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-stone-200'} rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                      placeholder="351..."
                      onChange={(e) => {
                        handleChange(e);
                        if (errors.phone) setErrors({...errors, phone: ''});
                      }}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-stone-700 mb-2">Cantidad Estimada</label>
                   <select 
                      name="quantity"
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      onChange={handleChange}
                   >
                      <option value="">Seleccionar cantidad...</option>
                      <option value="1-10">1 a 10 unidades</option>
                      <option value="11-50">11 a 50 unidades</option>
                      <option value="50+">Más de 50 unidades</option>
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Mensaje / Requerimientos</label>
                  <textarea 
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all"
                    placeholder="Contanos qué estás buscando..."
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" /> Enviar Consulta por WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Corporate;