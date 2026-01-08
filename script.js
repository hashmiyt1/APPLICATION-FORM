document.addEventListener('DOMContentLoaded', function(){
	const form = document.getElementById('applicationForm');
	const dobDay = document.getElementById('dobDay');
	const dobMonth = document.getElementById('dobMonth');
	const dobYear = document.getElementById('dobYear');
	const age = document.getElementById('age');
	const msg = document.getElementById('formMessage');

	// Populate year dropdown (last 100 years)
	const now = new Date();
	const currentYear = now.getFullYear();
	for(let y = currentYear; y >= currentYear - 100; y--){
		const opt = document.createElement('option');
		opt.value = y;
		opt.textContent = y;
		dobYear.appendChild(opt);
	}

	function calcAgeFromDOB(){
		if(!dobDay.value || !dobMonth.value || !dobYear.value){
			age.value = '';
			return;
		}
		const birth = new Date(dobYear.value, dobMonth.value - 1, dobDay.value);
		const now = new Date();
		let years = now.getFullYear() - birth.getFullYear();
		const m = now.getMonth() - birth.getMonth();
		if(m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
		age.value = years >= 0 ? years : '';
		const field = age.closest('.field');
		if(field && age.value) field.classList.add('filled');
	}

	// Calculate age when any DOB field changes
	[dobDay, dobMonth, dobYear].forEach(el => {
		el.addEventListener('change', calcAgeFromDOB);
	});

	// Prevent manual editing of age field
	age.addEventListener('input', ()=>{
		calcAgeFromDOB();
	});

	// Floating label helpers: mark .field as filled when input/select has value
	function refreshFieldState(el){
		const field = el.closest('.field');
		if(!field) return;
		// For file inputs, check files array; for others, check value
		const val = el.type === 'file' 
			? (el.files && el.files.length > 0 ? 'filled' : '')
			: (el.value || '').toString().trim();
		const label = field.querySelector('label');
		if(label) {
			if(val) {
				field.classList.add('filled');
				label.style.color = 'var(--accent-solid)';
			} else {
				field.classList.remove('filled');
				label.style.color = '#0b1220';
			}
		}
	}

	// Initialize field states and add listeners (excluding DOB dropdowns)
	Array.from(document.querySelectorAll('.field input, .field textarea, .field select')).forEach(el=>{
		// Skip DOB dropdowns, they're handled separately
		if(el.id.startsWith('dob')) return;
		refreshFieldState(el);
		el.addEventListener('input', ()=>refreshFieldState(el));
		el.addEventListener('change', ()=>refreshFieldState(el));
		if(el.type === 'file') el.addEventListener('change', ()=>refreshFieldState(el));
	});

	// Reset: clear filled states (browser may repopulate some fields)
	form.addEventListener('reset', ()=>{
		setTimeout(()=>{
			Array.from(document.querySelectorAll('.field input, .field textarea, .field select')).forEach(el=>{
				if(el.id.startsWith('dob')) return;
				refreshFieldState(el);
			});
			age.value = '';
			msg.textContent = '';
		},50);
	});

	form.addEventListener('submit', function(e){
		msg.textContent = '';

		// Simple built-in validity check
		if(!form.checkValidity()){
			e.preventDefault();
			form.reportValidity();
			return;
		}

		// Mobile pattern check (10 digits)
		const mobile = document.getElementById('mobile').value.replace(/\D/g,'');
		if(mobile.length !== 10){
			e.preventDefault();
			msg.textContent = 'Please enter a valid 10-digit mobile number.';
			return;
		}

		// Form is valid - Formspree will handle submission
		msg.textContent = 'Submitting your application...';
		// Don't prevent default - let Formspree handle the POST
	});
});
