export function AppFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <span className="text-sm font-semibold">TC</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">
                TCHOULFIAN
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Solution complète de gestion d&apos;équipes et de projets pour
              l&apos;industrie de la construction.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>Tableau de bord</li>
              <li>Planning</li>
              <li>Employés</li>
              <li>Projets</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>Centre d&apos;aide</li>
              <li>Documentation</li>
              <li>Contact</li>
              <li>Formation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Informations
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>Version 2.1.3</li>
              <li>Dernière mise à jour : 5 Nov 2024</li>
              <li>Serveur : Opérationnel</li>
              <li>Maintenance : Dimanche 03:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © 2024 TechConstruct Pro. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}





