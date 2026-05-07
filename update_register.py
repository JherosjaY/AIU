import re

with open('client/src/pages/Register.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Simulation Sequence
sim_old = "['firstName', 'lastName', 'birthDate', 'addressPurok', 'addressBarangay', 'addressCity', 'phone', 'email', 'course', 'cpFirstName', 'cpLastName', 'cpPhone', 'document']"
sim_new = "['firstName', 'lastName', 'birthday', 'homeCity', 'homeBarangay', 'homeProvince', 'phone', 'email', 'course', 'emergencyName', 'emergencyContact', 'document']"
code = code.replace(sim_old, sim_new)

# 2. Update Left Stepper Check Logic
old_stepper_logic = """            const steps = [
              { 
                n: '01', 
                l: 'Identify Identity', 
                s: (formData.firstName && formData.lastName && formData.birthDate) || view === 'review' ? 'complete' : (view === 'chat' || view === 'manual' ? 'active' : 'pending') 
              },
              { 
                n: '02', 
                l: 'Address & Contact', 
                s: (formData.addressCity && formData.phone && formData.email) || view === 'review' ? 'complete' : ((formData.firstName && formData.lastName && formData.birthDate) ? 'active' : 'pending') 
              },
              { 
                n: '03', 
                l: 'Academic Track', 
                s: formData.course || view === 'review' ? 'complete' : ((formData.addressCity && formData.phone && formData.email) ? 'active' : 'pending') 
              },
              { 
                n: '04', 
                l: 'Final Validation', 
                s: view === 'review' ? 'active' : 'pending' 
              }
            ];"""
new_stepper_logic = """            const steps = [
              { 
                n: '01', 
                l: 'Identification', 
                s: (formData.firstName && formData.lastName && formData.birthday) || view === 'review' ? 'complete' : (view === 'chat' || view === 'manual' ? 'active' : 'pending') 
              },
              { 
                n: '02', 
                l: 'Contact Info', 
                s: (formData.homeCity && formData.phone && formData.email) || view === 'review' ? 'complete' : ((formData.firstName && formData.lastName && formData.birthday) ? 'active' : 'pending') 
              },
              { 
                n: '03', 
                l: 'Family & Consent', 
                s: (formData.emergencyContact && formData.consent) || view === 'review' ? 'complete' : ((formData.homeCity && formData.phone && formData.email) ? 'active' : 'pending') 
              },
              { 
                n: '04', 
                l: 'Validation', 
                s: view === 'review' ? 'active' : 'pending' 
              }
            ];"""
code = code.replace(old_stepper_logic, new_stepper_logic)

# 3. Update Review Fields Array
old_review_array = """                  {[
                    { label: 'First Name', value: formData.firstName, icon: <User size={14} /> },
                    { label: 'Last Name', value: formData.lastName, icon: <User size={14} /> },
                    { label: 'Middle Name', value: formData.middleName, icon: <User size={14} /> },
                    { label: 'Suffix', value: formData.suffix, icon: <BadgeCheck size={14} /> },
                    { label: 'Phone Number', value: formData.phone, icon: <Phone size={14} /> },
                    { label: 'Primary Email', value: formData.email, icon: <Mail size={14} /> },
                    { label: 'Birth Date', value: formData.birthDate, icon: <Calendar size={14} /> },
                    { label: 'Purok/Sitio', value: formData.addressPurok, icon: <MapPin size={14} /> },
                    { label: 'Barangay', value: formData.addressBarangay, icon: <MapPin size={14} /> },
                    { label: 'City/Municipality', value: formData.addressCity, icon: <MapPin size={14} /> },
                    { label: 'Emg. Contact First Name', value: formData.cpFirstName, icon: <User size={14} /> },
                    { label: 'Emg. Contact Last Name', value: formData.cpLastName, icon: <User size={14} /> },
                    { label: 'Emg. Contact Phone', value: formData.cpPhone, icon: <Phone size={14} /> },
                    { label: 'Emg. Contact Address', value: formData.cpAddress, icon: <MapPin size={14} /> },
                  ].map((f, i) => ("""
new_review_array = """                  {[
                    { label: 'Prev School', value: formData.schoolName, icon: <Building size={14} /> },
                    { label: 'LRN', value: formData.lrn, icon: <BadgeCheck size={14} /> },
                    { label: 'First Name', value: formData.firstName, icon: <User size={14} /> },
                    { label: 'Last Name', value: formData.lastName, icon: <User size={14} /> },
                    { label: 'Middle Name', value: formData.middleName, icon: <User size={14} /> },
                    { label: 'Birth Date', value: formData.birthday, icon: <Calendar size={14} /> },
                    { label: 'Phone Number', value: formData.phone, icon: <Phone size={14} /> },
                    { label: 'Primary Email', value: formData.email, icon: <Mail size={14} /> },
                    { label: 'City/Municipality', value: formData.homeCity, icon: <MapPin size={14} /> },
                    { label: 'Province', value: formData.homeProvince, icon: <MapPin size={14} /> },
                    { label: 'Mother Name', value: formData.motherName, icon: <UserCircle size={14} /> },
                    { label: 'Father Name', value: formData.fatherName, icon: <UserCircle size={14} /> },
                    { label: 'Emg. Contact', value: formData.emergencyName, icon: <UserCircle size={14} /> },
                    { label: 'Emg. Phone', value: formData.emergencyContact, icon: <Phone size={14} /> },
                    { label: 'R.A. 10173 Consent', value: formData.consent ? 'AGREED' : 'PENDING', icon: <ShieldCheck size={14} /> },
                  ].map((f, i) => ("""
code = code.replace(old_review_array, new_review_array)

# 4. Update Manual Form Fields
old_manual_form = """                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                  {[
                    { name: 'firstName', label: 'First Name', icon: <User size={14} /> },
                    { name: 'lastName', label: 'Last Name', icon: <User size={14} /> },
                    { name: 'middleName', label: 'Middle Name', icon: <User size={14} /> },
                    { name: 'birthDate', label: 'Birth Date', placeholder: 'MM/DD/YYYY', icon: <Calendar size={14} /> },
                    { name: 'phone', label: 'Phone Number', icon: <Phone size={14} /> },
                    { name: 'email', label: 'Email', type: 'email', icon: <Mail size={14} /> },
                    { name: 'addressPurok', label: 'Purok/Sitio', icon: <MapPin size={14} /> },
                    { name: 'addressBarangay', label: 'Barangay', icon: <MapPin size={14} /> },
                    { name: 'addressCity', label: 'City/Municipality', icon: <MapPin size={14} /> },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-blue-100/20">{f.icon}</span>
                        <label className="text-[9px] font-black text-blue-100/30 uppercase tracking-[0.2em]">{f.label}</label>
                      </div>
                      <input 
                        name={f.name} 
                        value={formData[f.name]} 
                        onChange={handleManualInput} 
                        type={f.type || 'text'} 
                        placeholder={f.placeholder || ''} 
                        className={`w-full bg-transparent border-b-2 transition-all font-bold text-xl py-4 outline-none selection:bg-yellow-400/30 text-white placeholder:text-white/10 ${
                          formData[f.name] 
                            ? 'border-blue-400' 
                            : 'border-white/10 focus:border-yellow-400'
                        }`}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2 pt-6">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] italic mb-6 border-b border-white/5 pb-2">Emergency Contact Information</h4>
                  </div>

                  {[
                    { name: 'cpFirstName', label: 'Contact First Name', icon: <User size={14} /> },
                    { name: 'cpLastName', label: 'Contact Last Name', icon: <User size={14} /> },
                    { name: 'cpPhone', label: 'Contact Phone', icon: <Phone size={14} /> },
                    { name: 'cpAddress', label: 'Contact Address', icon: <MapPin size={14} /> },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-blue-100/20">{f.icon}</span>
                        <label className="text-[9px] font-black text-blue-100/30 uppercase tracking-[0.2em]">{f.label}</label>
                      </div>
                      <input 
                        name={f.name} 
                        value={formData[f.name]} 
                        onChange={handleManualInput} 
                        className={`w-full bg-transparent border-b-2 transition-all font-bold text-xl py-4 outline-none selection:bg-yellow-400/30 text-white placeholder:text-white/10 ${
                          formData[f.name] 
                            ? 'border-blue-400' 
                            : 'border-white/10 focus:border-yellow-400'
                        }`}
                      />
                    </div>
                  ))}"""
new_manual_form = """                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                  <div className="md:col-span-2"><h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] italic mb-6 border-b border-white/5 pb-2">Primary Identification</h4></div>
                  {[
                    { name: 'schoolName', label: 'Last School Attended', icon: <Building size={14} /> },
                    { name: 'lrn', label: 'LRN', icon: <BadgeCheck size={14} /> },
                    { name: 'firstName', label: 'First Name', icon: <User size={14} /> },
                    { name: 'lastName', label: 'Last Name', icon: <User size={14} /> },
                    { name: 'middleName', label: 'Middle Name', icon: <User size={14} /> },
                    { name: 'birthday', label: 'Birth Date (MM/DD/YYYY)', icon: <Calendar size={14} /> },
                    { name: 'civilStatus', label: 'Civil Status (e.g. Single)', icon: <User size={14} /> },
                    { name: 'citizenship', label: 'Citizenship', icon: <MapPin size={14} /> },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-blue-100/20">{f.icon}</span>
                        <label className="text-[9px] font-black text-blue-100/30 uppercase tracking-[0.2em]">{f.label}</label>
                      </div>
                      <input name={f.name} value={formData[f.name]} onChange={handleManualInput} type={f.type || 'text'} className={`w-full bg-transparent border-b-2 transition-all font-bold text-xl py-4 outline-none selection:bg-yellow-400/30 text-white placeholder:text-white/10 ${formData[f.name] ? 'border-blue-400' : 'border-white/10 focus:border-yellow-400'}`} />
                    </div>
                  ))}

                  <div className="md:col-span-2 pt-6"><h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] italic mb-6 border-b border-white/5 pb-2">Geographic & Contact</h4></div>
                  {[
                    { name: 'homeCity', label: 'City/Municipality', icon: <MapPin size={14} /> },
                    { name: 'homeBarangay', label: 'Barangay', icon: <MapPin size={14} /> },
                    { name: 'homeProvince', label: 'Province', icon: <MapPin size={14} /> },
                    { name: 'phone', label: 'Primary Contact', icon: <Phone size={14} /> },
                    { name: 'email', label: 'Email Address', type: 'email', icon: <Mail size={14} /> },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-blue-100/20">{f.icon}</span>
                        <label className="text-[9px] font-black text-blue-100/30 uppercase tracking-[0.2em]">{f.label}</label>
                      </div>
                      <input name={f.name} value={formData[f.name]} onChange={handleManualInput} type={f.type || 'text'} className={`w-full bg-transparent border-b-2 transition-all font-bold text-xl py-4 outline-none selection:bg-yellow-400/30 text-white placeholder:text-white/10 ${formData[f.name] ? 'border-blue-400' : 'border-white/10 focus:border-yellow-400'}`} />
                    </div>
                  ))}

                  <div className="md:col-span-2 pt-6"><h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] italic mb-6 border-b border-white/5 pb-2">Family & Emergency</h4></div>
                  {[
                    { name: 'motherName', label: 'Mother Name', icon: <UserCircle size={14} /> },
                    { name: 'fatherName', label: 'Father Name', icon: <UserCircle size={14} /> },
                    { name: 'emergencyName', label: 'Emg. Contact Name', icon: <User size={14} /> },
                    { name: 'emergencyContact', label: 'Emg. Contact No.', icon: <Phone size={14} /> },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-blue-100/20">{f.icon}</span>
                        <label className="text-[9px] font-black text-blue-100/30 uppercase tracking-[0.2em]">{f.label}</label>
                      </div>
                      <input name={f.name} value={formData[f.name]} onChange={handleManualInput} type={f.type || 'text'} className={`w-full bg-transparent border-b-2 transition-all font-bold text-xl py-4 outline-none selection:bg-yellow-400/30 text-white placeholder:text-white/10 ${formData[f.name] ? 'border-blue-400' : 'border-white/10 focus:border-yellow-400'}`} />
                    </div>
                  ))}"""
code = code.replace(old_manual_form, new_manual_form)

# 5. Add Consent Checkbox to Manual View (right before Review Application button)
consent_old = """                <div className="pt-8 pb-8">
                  <button onClick={() => setView('review')} className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 py-6 rounded-3xl font-black text-xl italic uppercase shadow-[0_20px_50px_rgba(251,191,36,0.2)] transition-all active:scale-[0.98] relative z-10 border border-yellow-500/50">"""
consent_new = """                <div className="p-8 mt-8 mb-8 rounded-[2rem] bg-yellow-400/5 border border-yellow-400/20 relative z-10">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <input type="checkbox" name="consent" checked={formData.consent} onChange={(e) => setFormData(prev => ({...prev, consent: e.target.checked}))} className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50" />
                        <span className="text-left text-[10px] font-bold text-blue-100/50 leading-relaxed italic">
                            I Agree, To give my consent to the collection, processing, and disclosure of my personal information to the Admissions Office of the Aura Integrated University, Inc. (AIU) in accordance with R.A. 10173 (Data Privacy Act of 2012).
                        </span>
                    </label>
                </div>

                <div className="pt-8 pb-8">
                  <button onClick={() => setView('review')} disabled={!formData.consent} className={`w-full py-6 rounded-3xl font-black text-xl italic uppercase transition-all relative z-10 border ${formData.consent ? 'bg-yellow-400 hover:bg-yellow-300 text-blue-900 shadow-[0_20px_50px_rgba(251,191,36,0.2)] border-yellow-500/50 active:scale-[0.98]' : 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed'}`}>"""
code = code.replace(consent_old, consent_new)

with open('client/src/pages/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done rewriting Register.jsx")
