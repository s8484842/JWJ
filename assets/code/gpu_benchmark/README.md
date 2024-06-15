# Data Visualization Final Project

### Topic: GPU Benchmark Visualization
github : https://github.com/stanleylin924/DataVis_GPU_Benchmark

### Team Members:
- 張嘉文 (80947003S) (80947003s@gapps.ntnu.edu.tw)
- 林滄原 (61147021S) (61147021s@gapps.ntnu.edu.tw)

### Overview

- In today's era, a computer's performance relies not only on the CPU but also on the
GPU. Having a high-performance GPU is crucial, especially for computer gamers,
content creators, AI developers, and more. A powerful GPU ensures a smoother
gaming experience and enhances work efficiency.

- When it comes to evaluating GPU performance, GPU benchmarks play a vital role in
assessing various aspects. However, for consumers, comparing GPUs among the
complexities of specifications, prices, and diverse benchmark metrics is not an easy
task. To simplify this process and aid consumers in making informed decisions, we
are developing a GPU benchmark visualization tool.

- The goal is to provide users seeking the right GPU with a visual representation of
GPU benchmarks. This tool will showcase the specifications, prices, and
performance metrics of different GPUs. Users will be able to filter or sort the data by
adjusting parameters, making it easier for them to find the GPU that suits their needs
through these visualizations.

### Dataset
1. Benchmark : https://www.kaggle.com/datasets/alanjo/gpu-benchmarks
2. Specification : https://www.kaggle.com/datasets/alanjo/graphics-card-full-specs

### Data and Data Processing

- Description of dataset
  - Our dataset is made up of thousands of graphics card benchmarks from PassMark
PerformanceTest. Each data has 8 attributes about benchmark (name, manufacturer,
category, test year, price, graphics 2D mark, graphics 3D mark, thermal design
power) and 7 attributes about specification (memory size, memory bus width, GPU
clock speed, memory clock speed, unified shaders, texture mapping units, render
output units). Using this data we will also derive 2 new attributes (cost performance,
power performance).

- Preprocessing of dataset
  - Merge the above two datasets.

### Usage scenarios & tasks

- Task 1: Alan is a casual gamer with a limited budget, and he wants to find GPUs
released in the last two years priced under 1000 dollars, suitable for gaming. He
wants to ﬁlter out options based on the release year and cost, and then compare
these GPUs in terms of performance, power consumption, cost-performance ratio
and overall value. This way, he can pinpoint the GPU that best suits his gaming needs
while staying within his budget.

- Task 2: Bill is an editor for a technology magazine, and he wants to write an
informative article on the latest GPU trends, including performance, features, and
cost-performance analysis. He wants to know what GPUs have been released by
various vendors this year, and he wants to be able to compare the metrics of these
GPUs and list the top ones and their specifications so that he can recommend them
to his readers.

- Task 3: Clara, a Product Manager at NVIDIA, is curious about how NVIDIA's GPUs
stack up in performance against those released by other companies each year. She's
exploring whether NVIDIA consistently leads the pack or if there have been instances
where other manufacturers outperformed them. Clara wants to compare the
performance and speciﬁcations of these GPUs to gather insights that can be used as
references for improving the next generation of products.

- Task 4: Dan is a GPU marketing analyst, and he wants to know the best-performing
GPUs over different time periods, highlighting manufacturers and specific models.

- Task 5: Emma is a 3D gaming enthusiast, and she wants to evaluate and compare
GPUs based on 3D benchmark scores, price, and cost-performance ratio for optimal
gaming experience.

- Task 6: Freda is an artificial intelligence researcher, and she wants to explore GPUs
suitable for AI model training, considering CUDA support. She doesn’t care about the
cost. Her goal is simple: to ﬁnd the top-performing GPU currently available that can
signiﬁcantly cut down the time it takes to train her AI models.

- Task 7: Gavin wants to buy a GPU with a higher cost performance ratio based on his
budget.

- Task 8: Hanna is a fan of NVIDIA GPUs, please don't show any other manufacturers.

### Visualization Design & Sketch
![圖片](https://github.com/stanleylin924/DataVis_GPU_Benchmark/assets/34412640/b5e13c59-81de-4f1a-9522-2610ea1f64cd)

- For task 1 and 7, users can select the desired years on the year axis in the parallel
coordinate plot and ﬁlter the GPUs based on their chosen price range on the price
axis. They can then use the bar chart to compare the performance, power
consumption, cost-performance ratio, and other evaluation metrics for the ﬁltered
GPUs. Users can set alignment reference points and choose sorting criteria for a
more detailed analysis. This allows them to ﬁnd an ideal GPU within their budget.

- For tasks 2, 3, and 4, users can choose a speciﬁc year in the parallel coordinate plot
and then compare and sort various metrics in the bar chart. This provides insights
into which GPUs achieve the highest scores across different metrics, along with
details about the brand, model, and speciﬁcations of these top-performing GPUs.

- For tasks 5 and 6, users can easily set the desired comparison criteria on the bar
chart and sort GPUs based on the selected metric, facilitating the identiﬁcation of
ideal GPUs.

- For task 8, users can highlight their preferred brands on the donut chart, and other
views will update to display only the GPUs from the selected brands. This allows
users to ﬁlter GPUs based on their preferred brands and then use the bar chart to
compare and sort GPUs across various metrics, assisting in the selection of their
ideal GPU.

### Work breakdown and schedule
![圖片](https://github.com/stanleylin924/DataVis_GPU_Benchmark/assets/34412640/8efcf612-31c2-4c9b-92a9-5783e5c2e0c1)
