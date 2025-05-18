"use strict";

import "./style.css";

import { html } from "code-tag";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

const swiper = new Swiper(".tech-stack-slider", {
  slidesPerView: "auto",
  spaceBetween: 30,
  loop: true,
  allowTouchMove: false, // Disable manual swiping
  autoplay: {
    delay: 1, // Minimal delay
    disableOnInteraction: false,
    reverseDirection: true,
  },
  speed: 6000, // Adjust this value to control the sliding speed
  slidesPerView: "auto",
  freeMode: {
    enabled: true,
    momentum: false,
  },
});

const workExperiences = [
  {
    role: "Senior AI Backend Engineer",
    place: "OpenAI",
    date: "Nov 2021 - Present",
    img: "./src/images/openai.png",
    responsibilities: [
      "Developed and maintained scalable APIs serving GPT models to millions of users",
      "Optimized inference performance across distributed systems and GPUs",
      "Built observability pipelines for monitoring latency, throughput, and model performance",
      "Collaborated with research teams to productionize cutting-edge LLMs",
      "Led backend security architecture for AI model deployment at scale",
    ],
    techUsed: [
      "Python",
      "FastAPI",
      "Kubernetes",
      "PyTorch",
      "Redis",
      "PostgreSQL",
      "TensorRT",
    ],
  },
  {
    role: "Machine Learning Infrastructure Engineer",
    place: "DeepMind",
    date: "Jul 2019 - Oct 2021",
    img: "./src/images/deepmind.png",
    responsibilities: [
      "Architected ML training pipelines for large-scale reinforcement learning experiments",
      "Built backend services to support data preprocessing and experiment orchestration",
      "Designed high-throughput storage solutions for terabytes of simulation data",
      "Implemented robust model versioning and deployment systems",
      "Optimized resource utilization across multi-GPU and TPU environments",
    ],
    techUsed: [
      "Python",
      "TensorFlow",
      "JAX",
      "Kubernetes",
      "gRPC",
      "BigQuery",
      "Airflow",
    ],
  },
  {
    role: "AI Backend Engineer",
    place: "Tesla Autopilot",
    date: "Mar 2017 - Jun 2019",
    img: "./src/images/tesla.png",
    responsibilities: [
      "Developed backend infrastructure for autonomous vehicle data ingestion and labeling",
      "Integrated ML models with real-time telemetry and sensor fusion pipelines",
      "Built APIs for model feedback loops used in over-the-air updates",
      "Ensured high availability and fault tolerance in edge-cloud syncing systems",
      "Worked closely with perception and planning teams to support rapid iteration of ML models",
    ],
    techUsed: [
      "Go",
      "Python",
      "Kafka",
      "MongoDB",
      "TensorRT",
      "Kubernetes",
      "AWS",
    ],
  },
  {
    role: "AI Research Engineer Intern",
    place: "NVIDIA",
    date: "Jun 2016 - Feb 2017",
    img: "./src/images/nvidia.png",
    responsibilities: [
      "Implemented deep learning models for computer vision using CUDA-optimized libraries",
      "Contributed to early versions of model parallelism and mixed-precision training",
      "Benchmarked neural network inference across multiple GPU architectures",
      "Collaborated with senior researchers to build internal experimentation frameworks",
      "Wrote technical documentation and presented findings to engineering leadership",
    ],
    techUsed: ["Python", "PyTorch", "CUDA", "TensorRT", "NCCL", "Docker"],
  },
];

function renderWork() {
  const workContainer = document.getElementById("workContainer");

  workContainer.innerHTML = workExperiences
    .map(
      (workEx) =>
        html`
          <div
            class="flex gap-9 p-6 rounded-xl shadow-xs justify-start items-start"
          >
            <div>
              <img class="w-16" src="${workEx.img}" alt="" />
            </div>
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold">${workEx.role}</h3>
              <p class="-mt-3 text-green-600">${workEx.place}</p>
              <ul class="list-disc list-inside text-gray-600">
                ${workEx.responsibilities
                  .map((responsibility) => `<li>${responsibility}</li>`)
                  .join("")}
              </ul>
              <ul class="flex gap-4 mt-2 text-gray-700 text-xs font-medium">
                ${workEx.techUsed
                  .map(
                    (tech) =>
                      `<li class="bg-gray-200 px-3 py-1 rounded-full">${tech}</li>`
                  )
                  .join("")}
              </ul>
            </div>
            <p class="ms-auto text-gray-500">${workEx.date}</p>
          </div>
        `
    )
    .join("");
}

renderWork();

const myProjects = [
  {
    title: "SmartCrop AI",
    img: "./src/images/smartcrop.gif",
    decs: "An intelligent crop recommendation system using historical weather, soil data, and satellite imagery to guide farmers on optimal planting strategies.",
    tech: ["Python", "TensorFlow", "FastAPI", "PostgreSQL"],
    githubRepo: true,
    liveDemo: false,
  },
  {
    title: "AutoLabeler",
    img: "./src/images/autolabeler.gif",
    decs: "Automated image labeling tool using a pre-trained YOLOv8 model with active learning to improve dataset quality with minimal human input.",
    tech: ["PyTorch", "YOLOv8", "Streamlit", "Docker"],
    githubRepo: true,
    liveDemo: true,
  },
  {
    title: "NeuroSynth",
    img: "./src/images/neurosynth.gif",
    decs: "Neural style transfer and image generation tool powered by custom-trained GANs. Allows users to mix artistic styles and generate original content.",
    tech: ["Python", "TensorFlow", "GANs", "Flask"],
    githubRepo: false,
    liveDemo: true,
  },
  {
    title: "ChatterBot GPT",
    img: "./src/images/chatterbot.gif",
    decs: "A conversational AI assistant built with OpenAI's GPT-4, integrated with custom memory and context management for dynamic multi-turn conversations.",
    tech: ["Next.js", "TypeScript", "OpenAI API", "Redis"],
    githubRepo: false,
    liveDemo: true,
  },
  {
    title: "MLflow ModelHub",
    img: "./src/images/mlflowhub.gif",
    decs: "A lightweight model registry and tracking platform built on top of MLflow for managing experiments, metrics, and model deployment pipelines.",
    tech: ["Python", "MLflow", "React", "FastAPI", "PostgreSQL"],
    githubRepo: true,
    liveDemo: false,
  },
  {
    title: "LangChain AI Agent",
    img: "./src/images/langchainagent.gif",
    decs: "A custom AI agent built using LangChain, able to reason over documents, search APIs, and execute code with integrated tools and memory.",
    tech: ["LangChain", "OpenAI", "Python", "Pinecone"],
    githubRepo: true,
    liveDemo: true,
  },
  {
    title: "DeepVision API",
    img: "./src/images/deepvision.gif",
    decs: "Production-ready image analysis API for classification, detection, and segmentation tasks using state-of-the-art models deployed on GPU servers.",
    tech: ["FastAPI", "ONNX", "Kubernetes", "PyTorch", "Cuda"],
    githubRepo: true,
    liveDemo: false,
  },
];

function renderProjects() {
  const projectContainer = document.getElementById("projectContainer");
  projectContainer.innerHTML = myProjects
    .map(
      (project) =>
        html`
          <div class="flex flex-col gap-2 rounded-2xl shadow overflow-hidden">
            <div class="h-52 bg-gray-100">
              <img
                class="h-full mx-auto"
                src="./src/images/lezzauth.gif"
                alt="Foto LezzAuth"
              />
            </div>

            <div class="flex flex-col gap-4 m-9">
              <h3 class="text-xl font-semibold">${project.title}</h3>
              <p>${project.decs}</p>

              <ul class="flex gap-6 text-gray-600 font-medium text-xs">
                <li class="bg-gray-200 px-3 py-1 rounded-2xl">React</li>
                ${project.tech
                  .map(
                    (tech) =>
                      `
                  <li class="bg-gray-200 px-3 py-1 rounded-2xl">${tech}</li>
                  `
                  )
                  .join("")}
              </ul>

              <div class="flex gap-8">
                ${project.githubRepo
                  ? `<div class="flex gap-1 text-blue-600 items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                  <span>View on GitHub</span>
                </div>`
                  : `<div class="flex gap-1">
                  <img src="./src/icons/icons8-github-logo.svg" alt="" />
                  <span>Private Repository</span>
                </div>`}
                <div class="flex gap-1 items-center">
                  <img
                    class="w-4 h-4"
                    src="./src/icons/expand-arrows.png"
                    alt=""
                  />
                  <span>Live Demo</span>
                </div>
              </div>
            </div>
          </div>
        `
    )
    .join("");
}

renderProjects();
