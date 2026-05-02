import { motion } from 'framer-motion'

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
          className="p-3 rounded-lg bg-dark-800/30 border border-dark-700/20"
        >
          <div className="h-3 bg-dark-700/50 rounded w-3/4 mb-2" />
          <div className="h-2 bg-dark-700/30 rounded w-1/2" />
        </motion.div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
