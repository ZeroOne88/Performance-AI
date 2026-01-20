import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, Persona, UserProfile, WorkoutPlan, DevotionalContent } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Helper to build a context string from the profile
const buildUserContext = (profile?: UserProfile): string => {
  if (!profile) return "";
  
  return `
  CONTEXTO DO USUÁRIO (Use estas informações para personalizar a resposta):
  - Nome: ${profile.name}
  - Idade: ${profile.age} anos
  - Sexo: ${profile.gender}
  - Peso: ${profile.weight}kg
  - Altura: ${profile.height}cm
  - Nível de Atividade: ${profile.activityLevel}
  - Objetivos: ${profile.goals.join(', ')}
  - Restrições Alimentares: ${profile.dietaryRestrictions || "Nenhuma"}
  - Condições Médicas: ${profile.medicalConditions || "Nenhuma"}
  `;
};

const BASE_INSTRUCTIONS: Record<string, string> = {
  nutri: `Você é um Nutricionista Esportivo de elite e Bioquímico. 
  Sua abordagem é baseada em ciência, focada em alta performance, longevidade e otimização metabólica.
  
  Diretrizes:
  - Considere ESTRITAMENTE as restrições alimentares e condições médicas do usuário.
  - Ajuste as calorias e macros baseados no peso, altura e nível de atividade fornecidos.
  - Forneça planos práticos e substituições de alimentos.
  - Explique o "porquê" bioquímico de forma acessível mas técnica quando necessário.
  - Foco em macros (Proteínas, Carbos, Gorduras) e micros essenciais.`,

  psych: `Você é um Psicólogo do Esporte e Especialista em Alta Performance Mental (Mindset Coach).
  Sua abordagem combina Terapia Cognitivo-Comportamental (TCC), Estoicismo e técnicas de Mindfulness.
  
  Diretrizes:
  - Personalize a abordagem baseada nos objetivos do usuário (ex: se quer perda de peso, foque na ansiedade alimentar; se performance, foque no fluxo).
  - Ajude o usuário a entrar em estado de "Flow".
  - Ofereça ferramentas para gestão de estresse.
  - Use perguntas socráticas para fazer o usuário refletir.`,

  coach: `Você é um Treinador de Alta Performance e Fisiologista do Exercício.
  Sua especialidade é otimizar o treinamento para ganho de força, hipertrofia e condicionamento metabólico.
  
  Diretrizes:
  - Leve em conta as lesões ou condições médicas citadas no perfil.
  - Ajuste o volume de treino conforme o nível de atividade atual (sedentário vs atleta).
  - Priorize a técnica e a prevenção de lesões.
  - Sugira periodização de treino.
  - Empurre o usuário para superar seus limites com segurança.`
};

export const sendMessageToGemini = async (
  currentMessage: string,
  history: Message[],
  persona: Persona,
  userProfile?: UserProfile
): Promise<string> => {
  if (!apiKey) return "Erro: API Key não encontrada.";

  const modelId = 'gemini-3-flash-preview';
  
  // Use generic instructions if persona is not in BASE_INSTRUCTIONS (e.g. routine/spirit logic handled separately)
  const baseInstruction = BASE_INSTRUCTIONS[persona] || "Você é um assistente de alta performance.";
  
  const systemInstruction = `
    ${baseInstruction}
    ${buildUserContext(userProfile)}
  `;

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: currentMessage
    });

    return result.text || "Não consegui gerar uma resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação.";
  }
};

export const generateDashboardTip = async (userProfile?: UserProfile): Promise<string> => {
    if (!apiKey) return "Configure sua API Key.";
    const context = userProfile ? `Para ${userProfile.name}, com objetivo de ${userProfile.goals.join(' e ')}.` : "";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Gere uma única frase curta, impactante e motivadora sobre alta performance humana (misturando saúde fisica e mental). ${context}`,
        });
        return response.text || "Mantenha o foco.";
    } catch (e) {
        return "Supere seus limites hoje.";
    }
}

export const generateWorkoutPlan = async (userProfile: UserProfile): Promise<WorkoutPlan | null> => {
  if (!apiKey) return null;

  const prompt = `Crie uma rotina de treino semanal completa (7 dias, de Segunda a Domingo) otimizada para este perfil.
  O ARRAY 'split' DEVE TER EXATAMENTE 7 ITENS, correspondendo a Segunda, Terça, Quarta, Quinta, Sexta, Sábado e Domingo.
  Inclua dias de descanso ativo ou total conforme necessário.
  
  ${buildUserContext(userProfile)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Nome do programa de treino" },
            description: { type: Type.STRING, description: "Breve explicação da estratégia." },
            split: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING, description: "Ex: 'Segunda - Peito', 'Terça - Costas' ou 'Domingo - Descanso'" },
                  focus: { type: Type.STRING, description: "Grupo muscular ou tipo de atividade (ex: Descanso Ativo)" },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        videoSearchTerm: { type: Type.STRING, description: "Termo de busca otimizado para encontrar um tutorial deste exercício no YouTube, ex: 'Supino Reto execução correta'" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WorkoutPlan;
    }
    return null;
  } catch (e) {
    console.error("Error generating workout:", e);
    return null;
  }
};

export const generateDevotional = async (userProfile?: UserProfile): Promise<DevotionalContent | null> => {
  if (!apiKey) return null;

  const prompt = `Gere um devocional bíblico curto focado em 'Alta Performance Espiritual'.
  Temas: Disciplina, Força, Resiliência, Propósito, Superação, Sabedoria.
  Conecte o versículo com a vida de um atleta ou pessoa que busca excelência.
  
  ${userProfile ? `Adapte para alguém que busca: ${userProfile.goals.join(', ')}` : ''}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING, description: "O texto do versículo bíblico" },
            reference: { type: Type.STRING, description: "ex: Filipenses 4:13" },
            reflection: { type: Type.STRING, description: "Uma reflexão poderosa conectando a fé com alta performance" },
            prayer: { type: Type.STRING, description: "Uma oração curta de empoderamento e gratidão" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DevotionalContent;
    }
    return null;
  } catch (e) {
    console.error("Error generating devotional:", e);
    return null;
  }
};