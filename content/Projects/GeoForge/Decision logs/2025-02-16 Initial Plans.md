---
title: 2025-02-16 Initial Plans
tags:
  - geoforge
  - perlin-noise
  - mesh
  - voxelisation
---
## Problem & Scope

The plan is to recreate my final year honours project from University. This honours project involved developing software that generated realistic 3D geological ore bodies under the ground. Unfortunately, we wrote this when we were inexperienced. It used python and was quite slow and poorly written.

The program consisted of a simple UI that took the size of the model in metres (x, y, z lengths), type of deposit & mineral (e.g. cooper porphyry), tonnage and grade (ratio of mass of the mineral extracted to the mass of the core). The program would then generate the model as a 3 dimensional array, which could be fed into an external program to visualise.

For example, this is the full output:
![[_images/Projects/GeoForge/Decision logs/honours-project-app-output-1.png|500]]
This is the output filtered by copper
![[_images/Projects/GeoForge/Decision logs/honours-project-app-output-2.png|500]]
To generate models, the program actually used a few pre-defined 3D meshes (.stl files) for each deposit type. The program would then (with some other steps in-between):

- load a random one of the meshes for the deposit type
- expand or shrink the mesh appropriately (with some random variation) to fit the expended model size
- randomly rotate the mesh
- apply perlin noise to the nodes of the mesh to completely randomise the shape. However, not too randomised so that it still showed some resemblance
- voxalise the mesh into cubes (stored as 3d array)
- export the array to the external project
## Decisions
- Recreate the project from scratch
- Named the project GeoForge
	- A GitHub organisation was created: https://github.com/0xGeoForge
	- A logo was created with an anvil in-front of the earth (first prototype)
- Use C++ to create a geological model generator library, geoforge-core, that can run on Linux & Windows (also maybe MacOS)
- Use Electron to develop the front-end desktop app that includes the UI and visualiser. The app will use the C++ library
- Create a drogon webserver back-end that uses the library
- Create a web based front-end that uses drogon as the backend
- Create many more deposit types (the previous one only had porphyry some other mineralisations)