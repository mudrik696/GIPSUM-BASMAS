$("ep").innerHTML = opts(PROGRAMS);
$("ed").valueAsDate = new Date();

async function loadDonors() {
  $("pm").textContent = "";
  const { data, error } = await sb
    .from("donors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  $("dn").innerHTML = data
    .map(
      (donor) => `
        <tr>
          <td>${fd(donor.created_at)}</td>
          <td>${esc(donor.anonim ? "Hamba Allah" : donor.nama)}</td>
          <td>${esc(donor.whatsapp || "-")}<br><span class="sm">${esc(donor.email || "")}</span></td>
          <td>${esc(donor.tipe)}<br><span class="sm">${esc(donor.frekuensi)}</span></td>
          <td>${esc(donor.program)}</td>
          <td>${rp(donor.nominal)}</td>
          <td>
            ${
              donor.status === "verified"
                ? '<span class="tag">Terverifikasi</span>'
                : `<button class="tbtn" type="button" data-v="${esc(donor.id)}">Verifikasi</button>`
            }
            <button class="tbtn" type="button" data-x="${esc(donor.id)}">Hapus</button>
          </td>
        </tr>`,
    )
    .join("");
}

async function showPanel() {
  const { data, error } = await sb.rpc("is_admin");
  if (error) {
    throw error;
  }

  const isAdmin = data === true;
  $("lgn").hidden = isAdmin;
  $("pn").hidden = !isAdmin;
  if (isAdmin) {
    await loadDonors();
  }
  return isAdmin;
}

$("dn").addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const verifyId = button.dataset.v;
  const deleteId = button.dataset.x;
  if (!verifyId && !(deleteId && confirm("Hapus data ini?"))) {
    return;
  }

  try {
    const result = verifyId
      ? await sb.from("donors").update({ status: "verified" }).eq("id", verifyId)
      : await sb.from("donors").delete().eq("id", deleteId);
    if (result.error) {
      throw result.error;
    }
    await loadDonors();
  } catch (error) {
    $("pm").textContent = `Gagal memperbarui donatur: ${error.message || error}`;
  }
});

$("lb").addEventListener("click", async () => {
  const email = $("le").value.trim();
  const password = $("lp").value;
  if (!email || !password) {
    $("lm").textContent = "Isi email dan password.";
    return;
  }

  $("lb").disabled = true;
  $("lm").textContent = "";
  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    if (!(await showPanel())) {
      $("lm").textContent = "Akun ini belum terdaftar sebagai bendahara.";
    }
  } catch (error) {
    $("lm").textContent = `Login gagal: ${error.message || error}`;
  } finally {
    $("lb").disabled = false;
  }
});

$("lo").addEventListener("click", async () => {
  try {
    const { error } = await sb.auth.signOut();
    if (error) {
      throw error;
    }
    $("lgn").hidden = false;
    $("pn").hidden = true;
    $("lm").textContent = "";
    $("pm").textContent = "";
  } catch (error) {
    $("pm").textContent = `Gagal logout: ${error.message || error}`;
  }
});

$("eb").addEventListener("click", async () => {
  const keterangan = $("ek").value.trim();
  const jumlah = Number($("ej").value);
  if (!keterangan || !Number.isFinite(jumlah) || jumlah <= 0) {
    $("pm").textContent = "Isi keterangan dan jumlah yang valid.";
    return;
  }

  $("eb").disabled = true;
  $("pm").textContent = "";
  try {
    const { error } = await sb.from("expenses").insert({
      tanggal: $("ed").value,
      program: $("ep").value,
      keterangan,
      jumlah,
    });
    if (error) {
      throw error;
    }
    $("ek").value = "";
    $("ej").value = "";
    $("pm").textContent = "Pengeluaran tercatat.";
  } catch (error) {
    $("pm").textContent = `Gagal mencatat pengeluaran: ${error.message || error}`;
  } finally {
    $("eb").disabled = false;
  }
});

showPanel().catch((error) => {
  $("lgn").hidden = false;
  $("pn").hidden = true;
  $("lm").textContent = `Gagal memuat panel admin: ${error.message || error}`;
});
