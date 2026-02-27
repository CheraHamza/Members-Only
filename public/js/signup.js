const membershipGroup = document.querySelector("#membershipGroup");
const adminGroup = document.querySelector("#adminGroup");

const membershipToggle = document.querySelector("input#membershipToggle");
const adminToggle = document.querySelector("input#adminToggle");

if (!adminToggle.checked) {
	adminGroup.style.display = "none";
} else {
	membershipGroup.style.display = "none";
	membershipToggle.disabled = true;
}

if (!membershipToggle.checked) {
	membershipGroup.style.display = "none";
}

adminToggle.addEventListener("change", (e) => {
	if (e.target.checked) {
		adminGroup.style.display = "flex";
		membershipToggle.checked = true;
		membershipToggle.disabled = true;
		membershipGroup.style.display = "none";
	} else {
		const adminInput = adminGroup.querySelector("input#admin");
		adminInput.value = "";

		adminGroup.style.display = "none";
		membershipToggle.checked = false;
		membershipToggle.disabled = false;
	}
});

membershipToggle.addEventListener("change", (e) => {
	if (e.target.checked) {
		membershipGroup.style.display = "flex";
	} else {
		const membershipInput = membershipGroup.querySelector("input#membership");
		membershipInput.value = "";
		membershipGroup.style.display = "none";
	}
});
