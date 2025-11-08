import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiEnvelope, HiPhone, HiMapPin, HiClock } from 'react-icons/hi2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: import('leaflet/dist/images/marker-icon.png'),
    shadowUrl: import('leaflet/dist/images/marker-shadow.png'),
});

const position: [number, number] = [3.8667, 11.5167]; // Coordonnées de Yaoundé

export default function Contact(): React.ReactElement {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logique d'envoi du formulaire
    };

    const contactInfo = [
        {
            icon: HiMapPin,
            title: "Notre Adresse",
            content: "Simbok Etok-koss, Yaoundé, Cameroun",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: HiPhone,
            title: "Téléphone",
            content: "+237 698 555 511",
            color: "from-green-500 to-green-600"
        },
        {
            icon: HiEnvelope,
            title: "Email",
            content: "contact@domilix.com",
            color: "from-orange-500 to-orange-600"
        },
        {
            icon: HiClock,
            title: "Heures d'ouverture",
            content: "Lun-Ven: 8h-18h",
            color: "from-purple-500 to-purple-600"
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #f97316 2%, transparent 0%)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* En-tête */}
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-orange-500 font-medium mb-2 block"
                    >
                        Contact
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-6"
                    >
                        Contactez-nous
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 max-w-2xl mx-auto"
                    >
                        Notre équipe est à votre disposition pour répondre à toutes vos questions
                    </motion.p>
                </div>

                {/* Informations de contact */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={info.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <info.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                            <p className="text-gray-600">{info.content}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Formulaire */}


                    {/* Carte */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg h-[600px]"
                    >
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={position}>
                                <Popup>
                                    Domilix<br />
                                    Simbok Etok-koss, Yaoundé
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </motion.div>
                </div>
            </div>
        </section>
    );
} 