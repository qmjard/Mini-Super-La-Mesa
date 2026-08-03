

import { iniciarSesion, registrarUsuario } from './api.js';
import { guardarSesion, estaAutenticado } from './session.js';
import { mostrarToast } from './ui.js';

const REGEX_EMAIL = /^\S+@\S+\.\S+$/;

document.addEventListener('DOMContentLoaded', () => {
  // si ya hay sesión activa, evita mostrar el formulario de nuevo
  if (estaAutenticado()) {
    window.location.href = 'index.html';
    return;
  }

  initLoginForm();
  initRegisterForm();
});

/* ---------- Utilidades de validación visual ---------- */
function marcarError(input, mensaje) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  const error = document.querySelector(`[data-error-for="${input.name}"]`);
  if (error) {
    error.textContent = mensaje;
    error.classList.add('is-visible');
  }
}

function marcarValido(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  const error = document.querySelector(`[data-error-for="${input.name}"]`);
  if (error) error.classList.remove('is-visible');
}

function validarCampo(input) {
  const valor = input.value.trim();

  if (input.hasAttribute('required') && !valor) {
    marcarError(input, 'Este campo es obligatorio');
    return false;
  }

  if (input.type === 'email' && !REGEX_EMAIL.test(valor)) {
    marcarError(input, 'Ingresa un correo electrónico válido');
    return false;
  }

  if (input.name === 'password' && valor.length < 6) {
    marcarError(input, 'La contraseña debe tener al menos 6 caracteres');
    return false;
  }

  if (input.name === 'confirmarPassword') {
    const passwordOriginal = document.querySelector('input[name="password"]')?.value;
    if (valor !== passwordOriginal) {
      marcarError(input, 'Las contraseñas no coinciden');
      return false;
    }
  }

  if (input.name === 'nombre' && valor.length < 2) {
    marcarError(input, 'Ingresa un nombre válido');
    return false;
  }

  marcarValido(input);
  return true;
}

function activarValidacionEnVivo(form) {
  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validarCampo(input);
    });
  });
}

function renderPasswordToggleIcon(boton, isVisible) {
  const iconSrc = isVisible ? 'assets/icon-eye-open.svg' : 'assets/icon-eye-closed.svg';
  boton.innerHTML = `<img src="${iconSrc}" alt="" aria-hidden="true" />`;
}

function togglePassword(boton) {
  const input = boton.previousElementSibling;
  const mostrarTexto = input.type === 'password';
  input.type = mostrarTexto ? 'text' : 'password';
  renderPasswordToggleIcon(boton, mostrarTexto);
}

/* ---------- Formulario de Login ---------- */
function initLoginForm() {
  const form = document.querySelector('#form-login');
  if (!form) return;

  activarValidacionEnVivo(form);
  form.querySelectorAll('.password-toggle').forEach((btn) =>
    btn.addEventListener('click', () => togglePassword(btn))
  );

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const inputs = [...form.querySelectorAll('.form-input')];
    const esValido = inputs.map(validarCampo).every(Boolean);
    if (!esValido) return;

    const boton = form.querySelector('button[type="submit"]');
    boton.classList.add('btn-loading');
    boton.disabled = true;

    try {
      const datos = Object.fromEntries(new FormData(form));
      const respuesta = await iniciarSesion({ email: datos.email, password: datos.password });
      guardarSesion(respuesta.token, respuesta.usuario);
      mostrarToast(`¡Bienvenido/a, ${respuesta.usuario.nombre}!`, 'success');
      window.location.href = 'index.html';
    } catch (error) {
      mostrarToast(error.message || 'Credenciales inválidas', 'error');
      boton.classList.remove('btn-loading');
      boton.disabled = false;
    }
  });
}

/* ---------- Formulario de Registro ---------- */
function initRegisterForm() {
  const form = document.querySelector('#form-registro');
  if (!form) return;

  activarValidacionEnVivo(form);
  form.querySelectorAll('.password-toggle').forEach((btn) =>
    btn.addEventListener('click', () => togglePassword(btn))
  );

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const inputs = [...form.querySelectorAll('.form-input')];
    const esValido = inputs.map(validarCampo).every(Boolean);
    if (!esValido) return;

    const boton = form.querySelector('button[type="submit"]');
    boton.classList.add('btn-loading');
    boton.disabled = true;

    try {
      const datos = Object.fromEntries(new FormData(form));
      const respuesta = await registrarUsuario({
        nombre: datos.nombre,
        email: datos.email,
        password: datos.password,
      });
      guardarSesion(respuesta.token, respuesta.usuario);
      mostrarToast(`Cuenta creada. ¡Bienvenido/a, ${respuesta.usuario.nombre}!`, 'success');
      window.location.href = 'index.html';
    } catch (error) {
      mostrarToast(error.message || 'No se pudo completar el registro', 'error');
      boton.classList.remove('btn-loading');
      boton.disabled = false;
    }
  });
}
