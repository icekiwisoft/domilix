import { getStat } from '@services/statApi';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Stats(): React.ReactElement {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    getStat().then((stats: any) => {
      setStats(stats);
    });
  }, []);

  return stats.length ? (
    <section className="py-20  relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, #f97316 2%, transparent 0%)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Titre de la section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Nos chiffres clés
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Découvrez l'impact de Domilix sur le marché immobilier
          </motion.p>
        </div>

        {/* Grille des statistiques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-500/50 transition-all duration-300  hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-baseline">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="text-4xl font-bold text-gray-900"
                      >
                        {stat.value}
                      </motion.span>
                      <span className="text-orange-500 text-2xl font-bold ml-1">+</span>
                    </div>
                    <h3 className="text-lg text-gray-600 font-medium">
                      {stat.name}
                    </h3>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl text-orange-500 opacity-80 group-hover:opacity-100 transition-all duration-300">
                    <stat.icon className="w-10 h-10" />
                  </div>
                </div>

                {/* Barre de progression décorative */}
                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ delay: index * 0.3, duration: 1 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  ) : null;
}
