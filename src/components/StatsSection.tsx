"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Quartiers protégés", value: 124 },
  { label: "Alertes envoyées", value: 3421 },
  { label: "Interventions rapides", value: 812 },
];

export default function StatsSection() {
  return (
    <section className="py-24 sm:py-32 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="mx-auto flex max-w-xs flex-col gap-y-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <dt className="text-base leading-7 text-gray-400">{stat.label}</dt>
              <dd className="order-first text-5xl font-black tracking-tight text-primary sm:text-6xl drop-shadow-md">
                {stat.value}+
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
