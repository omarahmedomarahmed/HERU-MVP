import { Link } from 'react-router-dom'
import HeruLogo from '@/components/shared/HeruLogo'

export default function PublicFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <HeruLogo className="h-8 mb-4" />
            <p className="text-zinc-400 text-sm leading-relaxed">
              The esports operating system for MENA. Powering gamers, organizers, sponsors, and service providers.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Products</p>
            <ul className="space-y-2">
              <li><Link to="/for-gamers" className="text-zinc-400 hover:text-red-400 text-sm transition-colors">HERU ARENA</Link></li>
              <li><Link to="/for-organizers" className="text-zinc-400 hover:text-purple-400 text-sm transition-colors">HERU BUILDER</Link></li>
              <li><Link to="/for-sponsors" className="text-zinc-400 hover:text-yellow-400 text-sm transition-colors">HERU RADAR</Link></li>
              <li><Link to="/for-providers" className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors">HERU GIGs</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Platform</p>
            <ul className="space-y-2">
              <li><Link to="/tournaments" className="text-zinc-400 hover:text-white text-sm transition-colors">Tournaments</Link></li>
              <li><Link to="/leaderboards" className="text-zinc-400 hover:text-white text-sm transition-colors">Leaderboards</Link></li>
              <li><Link to="/coaches" className="text-zinc-400 hover:text-white text-sm transition-colors">Coaches</Link></li>
              <li><Link to="/pricing" className="text-zinc-400 hover:text-white text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link to="/auth" className="text-zinc-400 hover:text-white text-sm transition-colors">Get Started</Link></li>
              <li><span className="text-zinc-600 text-sm">Privacy Policy</span></li>
              <li><span className="text-zinc-600 text-sm">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800/50 mt-8 pt-6 text-center">
          <p className="text-zinc-600 text-sm">© 2026 HERU.gg All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
