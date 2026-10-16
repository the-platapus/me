/**
 * Projects shown in the showcase, in display order. Adding an entry here is all
 * it takes to add a slide; put its images under assets/images/projects/<id>/.
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} category Shown vertically in the nav pill.
 * @property {string} title
 * @property {string} subtitle
 * @property {string} status
 * @property {string} description Typed out under the title.
 * @property {string[]} techStack
 * @property {string[]} images Paths relative to index.html; the first one is the cover.
 */

/** @type {Project[]} */
export const projects = [
  {
    id: "asus-p5440",
    category: "Hackintoshes",
    title: "ASUS ExpertBook P5440",
    subtitle: "Custom macOS OpenCore Architecture",
    status: "Fully Operational 🍏",
    description:
      "A tailored vanilla macOS build engineered specifically for the ASUS ExpertBook P5440 Ultrabook. Features seamless native hardware integration including complete ACPI power management, GPU metal acceleration, multi-touch gesture trackpad, native audio codecs, and full sleep/wake states through advanced OpenCore bootloader configuration and SSDT hotpatching.",
    techStack: ["OpenCore", "macOS Sonoma", "ACPI / ASL", "Kext Patching", "EFI Optimization"],
    images: [
      "assets/images/projects/asus-p5440/1.png",
      "assets/images/projects/asus-p5440/2.gif",
      "assets/images/projects/asus-p5440/3.png",
    ],
  },
  {
    id: "iot-engine-mgmt",
    category: "IoT Projects",
    title: "Engine Management System",
    subtitle: "Real-Time Embedded Telemetry & ECU Tuning",
    status: "Active Development ⚙️",
    description:
      "A precision standalone embedded IoT Engine Management System (EMS) crafted for real-time diagnostics, high-frequency CAN bus telemetry monitoring, and dynamic engine performance parameter control. Engineered to interface directly with engine instrumentation for sub-millisecond data logging and live diagnostics.",
    techStack: ["ESP32 / ARM", "CAN Bus Protocol", "C++ / Firmware", "Embedded Telemetry", "PCB Design"],
    images: ["assets/images/projects/iot-engine-mgmt/1.png"],
  },
  {
    id: "iot-ffb-wheel",
    category: "IoT Projects",
    title: "Force-Feedback Steering Wheel",
    subtitle: "High-Fidelity Sim-Racing Physics Hardware",
    status: "Prototype Operational 🏎️",
    description:
      "An advanced custom-engineered force-feedback simulation steering wheel system designed for competitive sim-racing. Harnesses closed-loop BLDC motor control, ultra-high resolution magnetic rotary encoders, and a custom haptic physics communication pipeline to translate vehicle telemetry into realistic physical resistance and road vibrations.",
    techStack: ["BLDC Motor Control", "Haptic Physics", "Microcontroller Firmware", "USB HID Protocol", "3D Modeling"],
    images: [
      "assets/images/projects/iot-ffb-wheel/1.png",
      "assets/images/projects/iot-ffb-wheel/2.png",
    ],
  },
];
