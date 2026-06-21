'use client'

import { useState } from 'react'
import Link from 'next/link'

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const navLinks = [
  { label: 'Como funciona', id: 'como-funciona' },
  { label: 'Funcionalidades', id: 'funcionalidades' },
  { label: 'Planos', id: 'planos' },
]

export default function NavHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function scrollTo(id: string) {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-[#1D9E75] select-none">FreelanceFlow</span>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
          >
            Já tenho conta
          </Link>
          <Link
            href="/cadastro"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
          >
            Começar grátis
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-700 text-left px-2 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Já tenho conta
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setMobileOpen(false)}
            className="inline-flex justify-center items-center px-4 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#188f68] transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      )}
    </header>
  )
}
