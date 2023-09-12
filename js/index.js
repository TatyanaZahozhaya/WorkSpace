const API_URL = "https://workspace-methed.vercel.app/";
const LOCATION_URL = "api/locations";
const VACANCY_URL = "api/vacancy";

const cardsList = document.querySelector(".cards-list");
const modalCloseButton = document.querySelector(".modal__close");
const modalWindow = document.querySelector(".modal");
const modalInfo = document.querySelector(".modal__info");

let lastUrl = "";
const vacanciesPagination = {};

const getData = async (url, callbackSuccess, callbackError) => {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, received ${res.status}`);
    }

    const data = await res.json();
    callbackSuccess(data);
  } catch (err) {
    callbackError(err);
  }
};

const addNewCard = (item, element) => {
  const {
    id,
    title,
    company,
    description,
    email,
    experience,
    format,
    location,
    logo,
    salary,
    type,
  } = item;

  element.insertAdjacentHTML(
    "beforeend",
    `<li class="card" data-id=${id}>
    <article class="card__container" tabindex="0">
      <div class="card__logo">
        <img
          src=${API_URL}${logo}
          alt="логотип компании ${company}"
          class="card__img"
        />
      </div>
      <div class="card__description">
        <p class="card__company-name">${company}</p>
        <h3 class="card__position">${title}</h3>
        <div class="card__position-description-container">
          <p class="card__position-description">от ${parseInt(
            salary
          ).toLocaleString()}₽</p>
          <p class="card__position-description">${type}</p>
          <p class="card__position-description">${format}</p>
          <p class="card__position-description">${experience}</p>
        </div>
      </div>
    </article>
  </li>`
  );
};

const renderMoreCards = (data) => {
  const { vacancies, pagination } = data;

  if (!vacancies || !vacancies.length) {
    console.log("oops");
  } else {
    vacancies.map((vacancy) => {
      addNewCard(vacancy, cardsList);
    });
  }

  if (pagination) {
    Object.assign(vacanciesPagination, pagination);
  }

  observer.observe(cardsList.lastElementChild);
};

const loadMoreVacancies = () => {
  if (vacanciesPagination.totalPages > vacanciesPagination.currentPage) {
    const urlWithParams = new URL(lastUrl);
    urlWithParams.searchParams.set("page", vacanciesPagination.currentPage + 1);

    getData(urlWithParams, renderMoreCards, (err) => {
      console.log(err);
    }).then(() => {
      lastUrl = urlWithParams;
    });
  }
};

const renderCardsFirstPage = (data) => {
  cardsList.textContent = "";
  renderMoreCards(data);
};

const closeModal = (e) => {
  if (
    (e.target && e.target === e.currentTarget) ||
    e.currentTarget.className === "modal__close"
  ) {
    modalWindow.classList.toggle("modal_hidden");
  }
};

const renderChapter = () => {};

const renderModal = (data) => {
  const {
    company,
    description,
    email,
    experience,
    format,
    id,
    location,
    logo,
    salary,
    title,
    type,
  } = data;
  modalWindow.classList.toggle("modal_hidden");
  modalInfo.textContent = "";
  const descriptionChapters = description.split("\n");
  const descriptionChaptersWithTags = descriptionChapters
    .map((chapter) => {
      return `<p class="modal__description-text">${chapter}</p>`;
    })
    .join(" ");

  modalInfo.insertAdjacentHTML(
    "beforeend",
    `<div class="modal__header">
      <img
        src=${API_URL}${logo}
        alt="логотип фирмы ${company}"
        class="modal__company-logo"
      />
      <p class="modal__company-name">${company}</p>
      <h2 class="modal__position">${title}</h2>
    </div>
    <div class="modal__main">
      <div class="modal__position-description">
      ${descriptionChaptersWithTags}
      </div>
      <ul class="modal__details">
        <li class="modal__details-item">от ${parseInt(
          salary
        ).toLocaleString()}₽</li>
        <li class="modal__details-item">${type}</li>
        <li class="modal__details-item">${format}</li>
        <li class="modal__details-item">${experience}</li>
        <li class="modal__details-item">${location}</li>
      </ul>
      <p class="modal__conclusion">
        Отправляйте резюме на
        <a href="${email}" class="modal__email">${email}</a>
      </p>
    </div>

    `
  );
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreVacancies();
      }
    });
  },
  { rootMargin: "100px" }
);

const init = () => {
  //select
  const citySelectElem = document.querySelector("#city");
  const addNewOption = (option, element) => {
    element.insertAdjacentHTML(
      "beforeend",
      `<option value=${option} class="input-elem__option">${option}</option>`
    );
  };

  getData(
    `${API_URL}${LOCATION_URL}`,
    (citiesList) => {
      citiesList.map((city) => {
        addNewOption(city, citySelectElem);
      });
    },
    (err) => {
      console.log(err);
    }
  );

  //vacancies list
  const vacanciesUrl = new URL(`${API_URL}${VACANCY_URL}`);

  getData(vacanciesUrl, renderCardsFirstPage, (err) => {
    console.log(err);
  }).then(() => {
    lastUrl = vacanciesUrl;
  });

  //modal

  const openModal = (id) => {
    const vacancyUrl = new URL(`${API_URL}${VACANCY_URL}/${id}`);

    getData(
      vacancyUrl,
      (data) => {
        renderModal(data);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  cardsList.addEventListener("click", (event) => {
    if (event.target && event.target.closest(".card")) {
      const cardId = event.target.closest(".card").dataset.id;
      openModal(cardId);
    }
  });
  modalCloseButton.addEventListener("click", closeModal);
  modalWindow.addEventListener("click", closeModal);

  //filter

  const filtersForm = document.querySelector(".filters");
  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(filtersForm);

    const urlWithParams = new URL(`${API_URL}${VACANCY_URL}`);
    formData.forEach((value, key) => {
      urlWithParams.searchParams.append(key, value);
    });

    getData(urlWithParams, renderCardsFirstPage, (err) => {
      console.log(err);
    }).then(() => {
      lastUrl = urlWithParams;
    });
  });

  const filtersToggleButton = document.querySelector(
    ".filters-section__toggle-button"
  );
  const filtersToggleIcon = document.querySelector(
    ".filters-section__arrow-icon"
  );
  filtersToggleButton.addEventListener("click", () => {
    filtersToggleIcon.classList.toggle("filters-section__arrow-icon_opened");
    filtersForm.classList.toggle("filters_hidden");
  });
};

init();
