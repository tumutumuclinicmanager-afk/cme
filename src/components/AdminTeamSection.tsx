import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Building2,
  Lock,
  Key,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Shield,
  UserCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { AdminUser, AdminRole, Language } from '../types';

interface AdminTeamSectionProps {
  adminUsers: AdminUser[];
  onAddAdmin: (newAdmin: AdminUser) => void;
  onRemoveAdmin: (adminId: string) => void;
  lang: Language;
  currentAdminEmail?: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'post_presentations', labelEn: 'Post & Publish New CME Presentations', labelFr: 'Publier de nouvelles présentations FMC' },
  { id: 'attach_clinical_images', labelEn: 'Upload & Attach Diagnostic Scans to Atlas', labelFr: 'Téléverser et ajouter des clichés à l’Atlas' },
  { id: 'manage_admins', labelEn: 'Add & Authorize Other Administrators', labelFr: 'Ajouter et autoriser d’autres administrateurs' },
  { id: 'edit_presentations', labelEn: 'Edit Existing Presentations & Slides', labelFr: 'Modifier les présentations et diapositives' },
  { id: 'manage_quizzes', labelEn: 'Author & Grade Interactive Clinical Quizzes', labelFr: 'Créer et évaluer les quiz cliniques' },
  { id: 'issue_certificates', labelEn: 'Audit & Issue Accredited CME Certificates', labelFr: 'Auditer et délivrer les attestations FMC' },
  { id: 'view_financials', labelEn: 'Access M-Pesa Revenue & Financial Audits', labelFr: 'Consulter les revenus M-Pesa et audits' },
];

export const AdminTeamSection: React.FC<AdminTeamSectionProps> = ({
  adminUsers,
  onAddAdmin,
  onRemoveAdmin,
  lang,
  currentAdminEmail = 'tumutumuclinicmanager@gmail.com',
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [copiedPasscodeId, setCopiedPasscodeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Adding Admin
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<AdminRole>('Clinical Faculty');
  const [institution, setInstitution] = useState<string>('Tumutumu Mission Hospital & Medical Centre');
  const [temporaryPasscode, setTemporaryPasscode] = useState<string>(() => {
    return `cme-${Math.random().toString(36).substring(2, 7)}-${Math.floor(100 + Math.random() * 900)}`;
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'post_presentations',
    'attach_clinical_images',
    'edit_presentations',
    'manage_quizzes',
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered admin users
  const filteredAdmins = adminUsers.filter((adm) => {
    const matchesSearch =
      adm.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || adm.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleGenerateNewPin = () => {
    setTemporaryPasscode(`cme-${Math.random().toString(36).substring(2, 7)}-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedName || !trimmedEmail) {
      setFormError(lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError(lang === 'fr' ? 'Adresse e-mail invalide.' : 'Please enter a valid email address.');
      return;
    }

    if (adminUsers.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      setFormError(
        lang === 'fr'
          ? 'Cet e-mail est déjà enregistré comme administrateur.'
          : 'An administrator with this email address already exists.'
      );
      return;
    }

    const newAdmin: AdminUser = {
      id: `adm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      email: trimmedEmail,
      fullName: trimmedName,
      role,
      institution: institution.trim() || 'P.C.E.A. Tumutumu Hospital',
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: currentAdminEmail,
      status: 'ACTIVE',
      permissions: selectedPermissions,
      temporaryPasscode: temporaryPasscode.trim() || 'cme2026',
    };

    onAddAdmin(newAdmin);
    setIsAddModalOpen(false);

    // Reset Form
    setFullName('');
    setEmail('');
    setRole('Clinical Faculty');
    handleGenerateNewPin();

    setToastMessage(
      lang === 'fr'
        ? `L'administrateur ${trimmedName} a été ajouté avec succès.`
        : `Administrator ${trimmedName} was added successfully with authorized credentials.`
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleCopyCredentials = (adm: AdminUser) => {
    const credText = `CME Kenya Administrator Credentials:\nName: ${adm.fullName}\nEmail: ${adm.email}\nRole: ${adm.role}\nPasscode: ${adm.temporaryPasscode || 'cme2026'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(credText);
    setCopiedPasscodeId(adm.id);
    setTimeout(() => setCopiedPasscodeId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast message */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {adminUsers.length} Active System Administrators
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {lang === 'fr' ? 'Gestion des Administrateurs & Faculté Médicale' : 'Administrator & Clinical Faculty Management'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {lang === 'fr'
              ? 'Déléguez des privilèges d’accès pour la création de modules FMC, le téléversement d’imagerie clinique, la notation des quiz et la délivrance des attestations officielles KMPDC.'
              : 'Authorize peer clinicians, department heads, and CME directors to publish peer-reviewed modules, upload high-resolution imaging, curate quizzes, and audit accredited CPD credits.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            handleGenerateNewPin();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Ajouter un Administrateur' : 'Add New Administrator'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'fr'
                ? 'Rechercher un administrateur par nom, e-mail ou hôpital...'
                : 'Search administrators by name, email address, or hospital...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 border border-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-full bg-slate-100 border border-transparent text-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium cursor-pointer"
          >
            <option value="All">{lang === 'fr' ? 'Tous les rôles' : 'All Roles'}</option>
            <option value="Super Admin">Super Admin</option>
            <option value="CME Director">CME Director</option>
            <option value="Clinical Faculty">Clinical Faculty</option>
            <option value="Curriculum Reviewer">Curriculum Reviewer</option>
            <option value="Accreditation Auditor">Accreditation Auditor</option>
          </select>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map((adm) => {
          const isRootAdmin = adm.email.toLowerCase() === 'tumutumuclinicmanager@gmail.com';
          const isCopied = copiedPasscodeId === adm.id;

          return (
            <div
              key={adm.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header row with Role & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      adm.role === 'Super Admin'
                        ? 'bg-blue-900 text-white'
                        : adm.role === 'CME Director'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : adm.role === 'Clinical Faculty'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {adm.role}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {adm.status}
                  </span>
                </div>

                {/* Name & Title */}
                <div>
                  <h4 className="text-base font-bold text-slate-900">{adm.fullName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{adm.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{adm.institution}</span>
                  </div>
                </div>

                {/* Permissions pills */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'fr' ? 'Autorisations accordées' : 'Assigned Privileges'} ({adm.permissions.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {adm.permissions.slice(0, 3).map((permId) => {
                      const meta = AVAILABLE_PERMISSIONS.find((p) => p.id === permId);
                      return (
                        <span
                          key={permId}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {meta ? (lang === 'fr' ? meta.labelFr.slice(0, 20) : meta.labelEn.slice(0, 20)) : permId}
                        </span>
                      );
                    })}
                    {adm.permissions.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                        +{adm.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata & Passcode */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lang === 'fr' ? 'Ajouté le' : 'Added'}: {adm.dateAdded}
                    </span>
                    <span className="font-mono text-slate-400 truncate max-w-[120px]">
                      by {adm.addedBy.split('@')[0]}
                    </span>
                  </div>

                  {adm.temporaryPasscode && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-600" />
                        Passcode:
                      </span>
                      <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {adm.temporaryPasscode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(adm)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Copy Login Credentials to Clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Copié !' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Copier l’accès' : 'Copy Credentials'}</span>
                    </>
                  )}
                </button>

                {!isRootAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          lang === 'fr'
                            ? `Êtes-vous sûr de vouloir révoquer l'accès administrateur de ${adm.fullName} ?`
                            : `Are you sure you want to revoke administrator privileges for ${adm.fullName}?`
                        )
                      ) {
                        onRemoveAdmin(adm.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                    title="Revoke Administrator Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Shield className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-semibold text-slate-800">
            {lang === 'fr' ? 'Aucun administrateur trouvé' : 'No administrators matched your search'}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === 'fr' ? 'Essayez de modifier votre filtre ou terme de recherche.' : 'Try adjusting your search query or role filter.'}
          </p>
        </div>
      )}

      {/* ADD ADMINISTRATOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden transition-all my-8">
            <div className="bg-blue-900 h-1.5 w-full" />

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {lang === 'fr' ? 'Autoriser un Nouvel Administrateur' : 'Authorize New Administrator'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'fr'
                        ? 'Accréditez un confrère ou directeur de département pour administrer la plateforme.'
                        : 'Grant administrative and clinical authoring privileges to certified clinicians.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'fr' ? 'Nom et Titre Médical *' : 'Clinician Full Name & Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Mwangi, MBChB, MMed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'fr' ? 'Adresse E-mail Professionnelle *' : 'Professional Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="j.mwangi@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'fr' ? 'Rôle Institutionnel *' : 'System Role *'}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Clinical Faculty">Clinical Faculty (Author & Uploads)</option>
                      <option value="CME Director">CME Director (Program Governance)</option>
                      <option value="Curriculum Reviewer">Curriculum Reviewer (Peer-Review)</option>
                      <option value="Accreditation Auditor">Accreditation Auditor (Certificates)</option>
                      <option value="Super Admin">Super Admin (Full Governance)</option>
                    </select>
                  </div>

                  {/* Institution */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'fr' ? 'Affiliation Hospitalière / Institution *' : 'Hospital Affiliation / Medical School *'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tumutumu Mission Hospital / Kenyatta National Hospital"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Temporary Passcode */}
                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        {lang === 'fr' ? 'Code d’accès provisoire' : 'Temporary Login Passcode'}
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateNewPin}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        {lang === 'fr' ? 'Régénérer' : 'Regenerate'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={temporaryPasscode}
                      onChange={(e) => setTemporaryPasscode(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      {lang === 'fr'
                        ? 'Le praticien pourra se connecter immédiatement via le portail administrateur avec cet e-mail et ce code.'
                        : 'The administrator will log in through the Administrator Sign In modal using this email and passcode.'}
                    </p>
                  </div>
                </div>

                {/* Permissions checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800">
                    {lang === 'fr' ? 'Privilèges & Droits d’accès' : 'Granular Administrative Privileges'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium leading-tight">
                            {lang === 'fr' ? perm.labelFr : perm.labelEn}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {lang === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Confirmer & Enregistrer' : 'Authorize & Save Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
