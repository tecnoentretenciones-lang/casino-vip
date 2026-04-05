// CONFIGURACIÓN SUPABASE - TECNOENTRETODO
const supabaseUrl = 'https://yuatovvzkhnakadwuixn.supabase.co';
const supabaseKey = 'sb_publishable_ueOVnJKbnGLPm6V3tTCEKQ_H_C63V7W';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// REGLAS DE NEGOCIO
const MULTIPLICADORES = { "9x1": 10, "5x1": 10, "Ruleta": 100, "Zoe": 1 };
const MONTOS_BONOS = { "NORMAL": 2000, "VIP": 3000, "SUPERESTRELLA": 4000 };

// 1. CARGAR LAS 17 MÁQUINAS DESDE LA NUBE
async function cargarPanel() {
    const { data: maquinas, error } = await _supabase.from('maquinas').select('*').order('id_fisico');
    if (error) return console.error(error);

    const grid = document.getElementById('grid-bazar');
    grid.innerHTML = '';

    maquinas.forEach(m => {
        grid.innerHTML += `
            <div class="card-m" onclick="alert('M-${m.id_fisico}: ${m.nombre_juego} cargada')">
                <div class="num">${m.id_fisico}</div>
                <div class="tipo">${m.nombre_juego}</div>
            </div>
        `;
    });
}

// 2. REGISTRAR GASTO (BEBIDAS, PASILLEROS, ETC)
async function registrarGasto() {
    const monto = document.getElementById('gasto-val').value;
    const desc = document.getElementById('gasto-nom').value;
    const cat = document.getElementById('gasto-cat').value;

    if(!monto || !desc) return alert("Por favor, completa los datos.");

    const { error } = await _supabase.from('movimientos').insert([{ 
        tipo: 'GASTO', monto: -parseInt(monto), descripcion: `${cat}: ${desc}` 
    }]);

    if (!error) {
        alert("✅ Gasto registrado en la nube correctamente.");
        location.reload();
    }
}

// 3. VALIDAR BONO (2000, 3000, 4000)
async function validarBono() {
    const qr = document.getElementById('qr-input').value;
    const pin = document.getElementById('pin-input').value;
    const hoy = new Date().toISOString().split('T')[0];

    const { data: cliente } = await _supabase.from('clientes_vip').select('*').eq('qr_id', qr).single();

    if (!cliente) return alert("❌ Cliente no existe en el sistema.");
    if (cliente.ultimo_bono === hoy) return alert("⚠️ Este cliente ya recibió su bono hoy.");
    
    if (cliente.pin === pin) {
        const monto = MONTOS_BONOS[cliente.nivel] || 2000;
        await _supabase.from('movimientos').insert([{ tipo: 'BONO', monto: -monto, descripcion: `Bono ${cliente.nivel} a ${qr}` }]);
        await _supabase.from('clientes_vip').update({ ultimo_bono: hoy }).eq('qr_id', qr);
        alert(`✅ AUTORIZADO: Entregar $${monto} (Nivel ${cliente.nivel})`);
    } else {
        alert("❌ PIN Incorrecto.");
    }
}

// FUNCIÓN PARA CAMBIAR DE PESTAÑA
function verTab(id) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(`sec-${id}`).classList.remove('hidden');
}

window.onload = cargarPanel;
