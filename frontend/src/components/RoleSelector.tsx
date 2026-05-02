import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiSparkles, HiAcademicCap, HiEye, HiBeaker } from 'react-icons/hi'
import { useResearchStore } from '../store/researchStore'
import type { UserRole } from '../types'

const RoleSelector: React.FC = () => {
  const navigate = useNavigate()
  const setUserRole = useResearchStore((state) => state.setUserRole)

  const roles = [
    {
      id: 'researcher' as UserRole,
      title: 'Researcher',
      icon: HiBeaker,
      description: 'Focus on research acceleration, novelty checks, and project management',
      features: [
        'Novelty validation with detailed scoring',
        'Project saving and version control',
        'Citation verification (PDF + URLs)',
        'Advanced research analytics',
      ],
      color: 'from-blue-600 to-indigo-600',
      hoverColor: 'hover:from-blue-500 hover:to-indigo-500',
    },
    {
      id: 'student' as UserRole,
      title: 'Student',
      icon: HiAcademicCap,
      description: 'Understand research papers, find connections, and discover knowledge gaps',
      features: [
        'Paper simplification (plain English)',
        'Connection mapping between papers',
        'Gap identification across literature',
        'Learning path recommendations',
      ],
      color: 'from-green-600 to-emerald-600',
      hoverColor: 'hover:from-green-500 hover:to-emerald-500',
    },
    {
      id: 'reviewer' as UserRole,
      title: 'Reviewer',
      icon: HiEye,
      description: 'AI-assisted peer review with citation verification and report generation',
      features: [
        'Citation verification and claim validation',
        'Review checklist generation',
        'Peer review report generation',
        'Paper comparison tools',
      ],
      color: 'from-purple-600 to-pink-600',
      hoverColor: 'hover:from-purple-500 hover:to-pink-500',
    },
  ]

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role)
    navigate(`/workspace/${role}`)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="text-center mb-12">
          <HiSparkles className="text-4xl text-indigo-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-gradient">Workspace</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Select the mode that best fits your research needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectRole(role.id)}
              className={`
                cursor-pointer group
                bg-dark-800/50 backdrop-blur-sm
                border border-dark-700/50 rounded-2xl
                p-6 space-y-4
                transition-all duration-300
                hover:border-indigo-500/50 hover:bg-dark-800/80
                hover:shadow-xl hover:shadow-indigo-600/10
              `}
            >
              <div className={`
                w-14 h-14 rounded-2xl mx-auto
                bg-gradient-to-br ${role.color} ${role.hoverColor}
                flex items-center justify-center
                transition-all duration-300
                group-hover:scale-110
              `}>
                <role.icon className="text-2xl text-white" />
              </div>

              <h3 className="text-xl font-bold text-white text-center">
                {role.title}
              </h3>

              <p className="text-gray-400 text-sm text-center">
                {role.description}
              </p>

              <ul className="space-y-2">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-indigo-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-3 rounded-xl font-semibold text-white
                  bg-gradient-to-r ${role.color} ${role.hoverColor}
                  transition-all duration-300
                  mt-4
                `}
              >
                Enter {role.title} Workspace
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default RoleSelector
