
const getApiUrl = () => {
  if (window.API_URL) {
    return window.API_URL;
  }

  const origin = window.location.origin;
  const port = window.location.port;

  if (!port || port === '80' || port === '443') {
    return `${origin}/api/users`;
  }

  return `http://${window.location.hostname}:3000/api/users`;
};

const API_URL = getApiUrl();

let userForm;
let formTitle;
let userIdInput;
let nameInput;
let emailInput;
let phoneInput;
let ageInput;
let cancelBtn;
let usersTbody;
let userCount;
let editingUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  userForm = document.getElementById("user-form");
  formTitle = document.getElementById("form-title");
  userIdInput = document.getElementById("user-id");
  nameInput = document.getElementById("name");
  emailInput = document.getElementById("email");
  phoneInput = document.getElementById("phone");
  ageInput = document.getElementById("age");
  cancelBtn = document.getElementById("cancel-btn");
  usersTbody = document.getElementById("users-tbody");
  userCount = document.getElementById("user-count");

  if (userForm) {
    userForm.addEventListener("submit", handleSubmit);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  loadUsers();
});
async function loadUsers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar usuários");

    const users = await response.json();
    renderUsers(users);
    updateUserCount(users.length);
  } catch (error) {
    console.error("Erro:", error);
    showError("Erro ao carregar usuários. Verifique se o servidor está rodando.");
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  console.log("Formulário submetido");

  const userData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim() || null,
    age: ageInput.value ? parseInt(ageInput.value) : null,
  };

  console.log("Dados do usuário:", userData);

  try {
    let response;
    const url = editingUserId ? `${API_URL}/${editingUserId}` : API_URL;
    const method = editingUserId ? "PUT" : "POST";

    console.log(`Enviando ${method} para ${url}`);

    response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("Resposta recebida:", response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao salvar usuário");
    }

    const result = await response.json();
    console.log("Usuário salvo com sucesso:", result);

    resetForm();
    loadUsers();
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert(error.message || "Erro ao salvar usuário. Verifique o console para mais detalhes.");
  }
}

async function editUser(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Erro ao carregar usuário");

    const user = await response.json();

    editingUserId = user.id;
    userIdInput.value = user.id;
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
    ageInput.value = user.age || "";

    formTitle.textContent = "Editar Usuário";
    cancelBtn.style.display = "block";

    document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao carregar usuário para edição");
  }
}

async function deleteUser(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir usuário");

    if (editingUserId === id) {
      resetForm();
    }
    loadUsers();
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao excluir usuário");
  }
}

function resetForm() {
  editingUserId = null;
  userIdInput.value = "";
  userForm.reset();
  formTitle.textContent = "Cadastrar Novo Usuário";
  cancelBtn.style.display = "none";
}

function renderUsers(users) {
  if (users.length === 0) {
    usersTbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">Nenhum usuário cadastrado ainda.</td>
      </tr>
    `;
    return;
  }

  usersTbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${user.phone || "-"}</td>
      <td>${user.age || "-"}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-edit" onclick="editUser(${user.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteUser(${user.id})">Excluir</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

function updateUserCount(count) {
  userCount.textContent = `${count} usuário${count !== 1 ? "s" : ""}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  usersTbody.innerHTML = `
    <tr class="empty-state">
      <td colspan="6" style="color: var(--danger-color);">${escapeHtml(message)}</td>
    </tr>
  `;
}

window.editUser = editUser;
window.deleteUser = deleteUser;

