-- Insert additional sample article with id "2" to match the URL
INSERT INTO public.articles (id, title, authors, abstract, content, subject, published_date, status, submitter_id) VALUES 
('00000000-0000-0000-0000-000000000002', 
'Machine Learning Applications in Climate Modeling',
'["Dr. Jennifer Chen", "Prof. Robert Martinez", "Dr. Lisa Thompson"]',
'We present a comprehensive study on the application of deep learning techniques to improve climate prediction models. Our neural network approach shows 35% better accuracy in long-term weather forecasting.',
'## Abstract

Climate modeling represents one of the most computationally intensive challenges in modern science. This paper explores how machine learning, particularly deep neural networks, can enhance the accuracy and efficiency of climate prediction models.

## Introduction

Traditional climate models rely on complex differential equations that simulate atmospheric, oceanic, and land surface processes. While these models have been successful, they require enormous computational resources and often struggle with long-term predictions.

## Methodology

We developed a hybrid approach that combines:
- Convolutional Neural Networks (CNNs) for spatial pattern recognition
- Long Short-Term Memory (LSTM) networks for temporal dynamics
- Ensemble methods for uncertainty quantification

Our model was trained on 30 years of historical climate data from multiple sources including satellite observations, weather stations, and ocean buoys.

## Results

The experimental validation shows significant improvements:
- 35% improvement in temperature prediction accuracy
- 28% better precipitation forecasting
- 15% reduction in computational time
- Enhanced ability to predict extreme weather events

## Discussion

The integration of machine learning with traditional physics-based models opens new possibilities for climate science. Our approach maintains the interpretability of physical models while leveraging the pattern recognition capabilities of neural networks.

## Conclusion

This work demonstrates the potential of machine learning to revolutionize climate modeling. Future research will focus on incorporating more diverse data sources and extending predictions to longer time horizons.',
'Climate Science',
'2024-02-20',
'published',
'00000000-0000-0000-0000-000000000000');