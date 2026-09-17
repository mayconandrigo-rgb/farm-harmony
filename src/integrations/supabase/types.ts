export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abates: {
        Row: {
          created_at: string
          data: string
          especie: string | null
          finalidade: string | null
          id: string
          observacoes: string | null
          peso: number | null
          quantidade: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          especie?: string | null
          finalidade?: string | null
          id?: string
          observacoes?: string | null
          peso?: number | null
          quantidade?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          especie?: string | null
          finalidade?: string | null
          id?: string
          observacoes?: string | null
          peso?: number | null
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
      }
      adubacoes: {
        Row: {
          created_at: string
          data: string
          forma_aplicacao: string | null
          id: string
          observacoes: string | null
          produto_id: string | null
          quantidade: number | null
          talhao_id: string | null
          unidade: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          forma_aplicacao?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number | null
          talhao_id?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          forma_aplicacao?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number | null
          talhao_id?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adubacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_saldo"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "adubacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adubacoes_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_solo: {
        Row: {
          created_at: string
          data: string
          id: string
          laboratorio: string | null
          observacoes: string | null
          resultado: string | null
          talhao_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          laboratorio?: string | null
          observacoes?: string | null
          resultado?: string | null
          talhao_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          laboratorio?: string | null
          observacoes?: string | null
          resultado?: string | null
          talhao_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_solo_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      anexos: {
        Row: {
          created_at: string
          created_by: string | null
          entidade: string
          id: string
          mime_type: string | null
          nome: string
          path: string
          registro_id: string | null
          tamanho: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entidade: string
          id?: string
          mime_type?: string | null
          nome: string
          path: string
          registro_id?: string | null
          tamanho?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entidade?: string
          id?: string
          mime_type?: string | null
          nome?: string
          path?: string
          registro_id?: string | null
          tamanho?: number | null
        }
        Relationships: []
      }
      animais: {
        Row: {
          created_at: string
          data_nascimento: string | null
          especie: string
          id: string
          identificacao: string | null
          lote: string | null
          nome: string | null
          observacoes: string | null
          pasto_id: string | null
          peso: number | null
          raca: string | null
          sexo: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          especie?: string
          id?: string
          identificacao?: string | null
          lote?: string | null
          nome?: string | null
          observacoes?: string | null
          pasto_id?: string | null
          peso?: number | null
          raca?: string | null
          sexo?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          especie?: string
          id?: string
          identificacao?: string | null
          lote?: string | null
          nome?: string | null
          observacoes?: string | null
          pasto_id?: string | null
          peso?: number | null
          raca?: string | null
          sexo?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animais_pasto_id_fkey"
            columns: ["pasto_id"]
            isOneToOne: false
            referencedRelation: "pastos"
            referencedColumns: ["id"]
          },
        ]
      }
      aplicacoes_defensivos: {
        Row: {
          alvo: string | null
          created_at: string
          data: string
          dose: number | null
          id: string
          observacoes: string | null
          produto_id: string | null
          talhao_id: string | null
          tipo_alvo: string | null
          unidade: string | null
          updated_at: string
        }
        Insert: {
          alvo?: string | null
          created_at?: string
          data?: string
          dose?: number | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          talhao_id?: string | null
          tipo_alvo?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          alvo?: string | null
          created_at?: string
          data?: string
          dose?: number | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          talhao_id?: string | null
          tipo_alvo?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aplicacoes_defensivos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_saldo"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "aplicacoes_defensivos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicacoes_defensivos_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      armazens: {
        Row: {
          created_at: string
          id: string
          localizacao: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          localizacao?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          localizacao?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      centros_custo: {
        Row: {
          atividade: string | null
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          atividade?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          atividade?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          categoria: string | null
          centro_custo_id: string | null
          created_at: string
          data_pagamento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          nota_fiscal_id: string | null
          observacoes: string | null
          parceiro_id: string | null
          parcela: number | null
          plano_conta_id: string | null
          status: string
          tipo: string
          total_parcelas: number | null
          updated_at: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          categoria?: string | null
          centro_custo_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          nota_fiscal_id?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          parcela?: number | null
          plano_conta_id?: string | null
          status?: string
          tipo?: string
          total_parcelas?: number | null
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Update: {
          categoria?: string | null
          centro_custo_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          nota_fiscal_id?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          parcela?: number | null
          plano_conta_id?: string | null
          status?: string
          tipo?: string
          total_parcelas?: number | null
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_plano_conta_id_fkey"
            columns: ["plano_conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          armazem_id: string | null
          created_at: string
          cultura: string | null
          data_conclusao_prevista: string | null
          data_contrato: string | null
          data_inicio_entrega: string | null
          id: string
          numero: string | null
          observacoes: string | null
          parceiro_id: string | null
          percentual_entrega: number
          preco: number | null
          quantidade_kg: number
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          armazem_id?: string | null
          created_at?: string
          cultura?: string | null
          data_conclusao_prevista?: string | null
          data_contrato?: string | null
          data_inicio_entrega?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          percentual_entrega?: number
          preco?: number | null
          quantidade_kg?: number
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          armazem_id?: string | null
          created_at?: string
          cultura?: string | null
          data_conclusao_prevista?: string | null
          data_contrato?: string | null
          data_inicio_entrega?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          percentual_entrega?: number
          preco?: number | null
          quantidade_kg?: number
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_armazem_id_fkey"
            columns: ["armazem_id"]
            isOneToOne: false
            referencedRelation: "armazens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      culturas: {
        Row: {
          ciclo: string | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ciclo?: string | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ciclo?: string | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      despescas: {
        Row: {
          created_at: string
          data: string
          destino: string | null
          id: string
          observacoes: string | null
          peso_kg: number | null
          quantidade: number | null
          tanque_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          destino?: string | null
          id?: string
          observacoes?: string | null
          peso_kg?: number | null
          quantidade?: number | null
          tanque_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          destino?: string | null
          id?: string
          observacoes?: string | null
          peso_kg?: number | null
          quantidade?: number | null
          tanque_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "despescas_tanque_id_fkey"
            columns: ["tanque_id"]
            isOneToOne: false
            referencedRelation: "tanques"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentos: {
        Row: {
          area: string | null
          centro_custo_id: string | null
          created_at: string
          created_by: string | null
          custo_total: number | null
          custo_unitario: number | null
          data: string
          id: string
          nota_fiscal_id: string | null
          observacoes: string | null
          produto_id: string
          quantidade: number
          referencia: string | null
          responsavel: string | null
          talhao_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          centro_custo_id?: string | null
          created_at?: string
          created_by?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          data?: string
          id?: string
          nota_fiscal_id?: string | null
          observacoes?: string | null
          produto_id: string
          quantidade?: number
          referencia?: string | null
          responsavel?: string | null
          talhao_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          centro_custo_id?: string | null
          created_at?: string
          created_by?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          data?: string
          id?: string
          nota_fiscal_id?: string | null
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          referencia?: string | null
          responsavel?: string | null
          talhao_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_saldo"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "estoque_movimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentos_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_pagamento: {
        Row: {
          adicionais: number | null
          ano: number
          created_at: string
          data_pagamento: string | null
          descontos: number | null
          funcionario_id: string
          id: string
          mes: number
          observacoes: string | null
          salario_base: number
          status: string
          updated_at: string
          valor_liquido: number | null
        }
        Insert: {
          adicionais?: number | null
          ano: number
          created_at?: string
          data_pagamento?: string | null
          descontos?: number | null
          funcionario_id: string
          id?: string
          mes: number
          observacoes?: string | null
          salario_base?: number
          status?: string
          updated_at?: string
          valor_liquido?: number | null
        }
        Update: {
          adicionais?: number | null
          ano?: number
          created_at?: string
          data_pagamento?: string | null
          descontos?: number | null
          funcionario_id?: string
          id?: string
          mes?: number
          observacoes?: string | null
          salario_base?: number
          status?: string
          updated_at?: string
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          cargo: string | null
          conta: string | null
          cpf: string | null
          created_at: string
          data_admissao: string | null
          funcao: string | null
          id: string
          nome: string
          pix: string | null
          salario: number | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          cargo?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          funcao?: string | null
          id?: string
          nome: string
          pix?: string | null
          salario?: number | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          cargo?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          funcao?: string | null
          id?: string
          nome?: string
          pix?: string | null
          salario?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lotes_aves: {
        Row: {
          created_at: string
          data_entrada: string | null
          galinheiro: string | null
          id: string
          nome: string
          observacoes: string | null
          quantidade: number
          raca: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_entrada?: string | null
          galinheiro?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          quantidade?: number
          raca?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_entrada?: string | null
          galinheiro?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          quantidade?: number
          raca?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maquinas: {
        Row: {
          ano: number | null
          created_at: string
          id: string
          marca: string | null
          modelo: string | null
          nome: string
          observacoes: string | null
          placa: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          nome: string
          observacoes?: string | null
          placa?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          nome?: string
          observacoes?: string | null
          placa?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      nascimentos: {
        Row: {
          created_at: string
          data: string
          especie: string | null
          id: string
          identificacao: string | null
          mae_id: string | null
          observacoes: string | null
          peso: number | null
          sexo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          especie?: string | null
          id?: string
          identificacao?: string | null
          mae_id?: string | null
          observacoes?: string | null
          peso?: number | null
          sexo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          especie?: string | null
          id?: string
          identificacao?: string | null
          mae_id?: string | null
          observacoes?: string | null
          peso?: number | null
          sexo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nascimentos_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_itens: {
        Row: {
          cfop: string | null
          created_at: string
          custo_unitario: number | null
          descricao: string | null
          id: string
          ncm: string | null
          nota_fiscal_id: string
          produto_id: string | null
          quantidade: number
          unidade: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          cfop?: string | null
          created_at?: string
          custo_unitario?: number | null
          descricao?: string | null
          id?: string
          ncm?: string | null
          nota_fiscal_id: string
          produto_id?: string | null
          quantidade?: number
          unidade?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          cfop?: string | null
          created_at?: string
          custo_unitario?: number | null
          descricao?: string | null
          id?: string
          ncm?: string | null
          nota_fiscal_id?: string
          produto_id?: string | null
          quantidade?: number
          unidade?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nf_itens_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nf_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_saldo"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "nf_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          centro_custo_id: string | null
          created_at: string
          data_emissao: string
          frete: number | null
          icms: number | null
          id: string
          numero: string | null
          observacoes: string | null
          parceiro_id: string | null
          pis_cofins: number | null
          tipo: string
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          centro_custo_id?: string | null
          created_at?: string
          data_emissao?: string
          frete?: number | null
          icms?: number | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          pis_cofins?: number | null
          tipo?: string
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          centro_custo_id?: string | null
          created_at?: string
          data_emissao?: string
          frete?: number | null
          icms?: number | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          parceiro_id?: string | null
          pis_cofins?: number | null
          tipo?: string
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias_lavoura: {
        Row: {
          acao_tomada: string | null
          created_at: string
          data: string
          descricao: string | null
          id: string
          safra: string | null
          severidade: string | null
          talhao_id: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          acao_tomada?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          safra?: string | null
          severidade?: string | null
          talhao_id?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          acao_tomada?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          safra?: string | null
          severidade?: string | null
          talhao_id?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_lavoura_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          contato: string | null
          created_at: string
          documento: string | null
          endereco: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          contato?: string | null
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          contato?: string | null
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      pastos: {
        Row: {
          area_ha: number | null
          capacidade: number | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          capacidade?: number | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          capacidade?: number | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plano_contas: {
        Row: {
          ativo: boolean
          codigo: string | null
          created_at: string
          id: string
          natureza: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          id?: string
          natureza?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          id?: string
          natureza?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      plantios: {
        Row: {
          created_at: string
          cultura: string | null
          data_plantio: string
          id: string
          observacoes: string | null
          quantidade_semente: number | null
          safra: string | null
          talhao_id: string | null
          unidade: string | null
          updated_at: string
          variedade: string | null
        }
        Insert: {
          created_at?: string
          cultura?: string | null
          data_plantio?: string
          id?: string
          observacoes?: string | null
          quantidade_semente?: number | null
          safra?: string | null
          talhao_id?: string | null
          unidade?: string | null
          updated_at?: string
          variedade?: string | null
        }
        Update: {
          created_at?: string
          cultura?: string | null
          data_plantio?: string
          id?: string
          observacoes?: string | null
          quantidade_semente?: number | null
          safra?: string | null
          talhao_id?: string | null
          unidade?: string | null
          updated_at?: string
          variedade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantios_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      povoamentos: {
        Row: {
          created_at: string
          data: string
          especie: string | null
          id: string
          observacoes: string | null
          quantidade_alevinos: number | null
          tanque_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          especie?: string | null
          id?: string
          observacoes?: string | null
          quantidade_alevinos?: number | null
          tanque_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          especie?: string | null
          id?: string
          observacoes?: string | null
          quantidade_alevinos?: number | null
          tanque_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "povoamentos_tanque_id_fkey"
            columns: ["tanque_id"]
            isOneToOne: false
            referencedRelation: "tanques"
            referencedColumns: ["id"]
          },
        ]
      }
      producao_ovos: {
        Row: {
          created_at: string
          data: string
          id: string
          lote_id: string | null
          observacoes: string | null
          quantidade: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          quantidade?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producao_ovos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes_aves"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string
          created_at: string
          custo_medio: number
          estoque_minimo: number | null
          id: string
          nome: string
          observacoes: string | null
          unidade: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          custo_medio?: number
          estoque_minimo?: number | null
          id?: string
          nome: string
          observacoes?: string | null
          unidade?: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          custo_medio?: number
          estoque_minimo?: number | null
          id?: string
          nome?: string
          observacoes?: string | null
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      romaneios: {
        Row: {
          armazem_id: string | null
          avariados: number | null
          contrato_id: string | null
          created_at: string
          cultura: string | null
          data_hora: string
          id: string
          impureza: number | null
          mofado: number | null
          motorista: string | null
          nota_fiscal: string | null
          numero: string | null
          origem: string | null
          outros: string | null
          peso_bruto: number
          peso_liquido: number | null
          peso_tara: number
          placa: string | null
          quebrados: number | null
          talhao_id: string | null
          umidade: number | null
          updated_at: string
          verde: number | null
        }
        Insert: {
          armazem_id?: string | null
          avariados?: number | null
          contrato_id?: string | null
          created_at?: string
          cultura?: string | null
          data_hora?: string
          id?: string
          impureza?: number | null
          mofado?: number | null
          motorista?: string | null
          nota_fiscal?: string | null
          numero?: string | null
          origem?: string | null
          outros?: string | null
          peso_bruto?: number
          peso_liquido?: number | null
          peso_tara?: number
          placa?: string | null
          quebrados?: number | null
          talhao_id?: string | null
          umidade?: number | null
          updated_at?: string
          verde?: number | null
        }
        Update: {
          armazem_id?: string | null
          avariados?: number | null
          contrato_id?: string | null
          created_at?: string
          cultura?: string | null
          data_hora?: string
          id?: string
          impureza?: number | null
          mofado?: number | null
          motorista?: string | null
          nota_fiscal?: string | null
          numero?: string | null
          origem?: string | null
          outros?: string | null
          peso_bruto?: number
          peso_liquido?: number | null
          peso_tara?: number
          placa?: string | null
          quebrados?: number | null
          talhao_id?: string | null
          umidade?: number | null
          updated_at?: string
          verde?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "romaneios_armazem_id_fkey"
            columns: ["armazem_id"]
            isOneToOne: false
            referencedRelation: "armazens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      talhoes: {
        Row: {
          area_ha: number
          created_at: string
          cultura_atual: string | null
          id: string
          nome: string
          observacoes: string | null
          safra: string | null
          updated_at: string
        }
        Insert: {
          area_ha?: number
          created_at?: string
          cultura_atual?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          safra?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number
          created_at?: string
          cultura_atual?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          safra?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tanques: {
        Row: {
          capacidade: number | null
          created_at: string
          especie: string | null
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          capacidade?: number | null
          created_at?: string
          especie?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          capacidade?: number | null
          created_at?: string
          especie?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacinacoes: {
        Row: {
          animal_id: string | null
          created_at: string
          data: string
          dose: string | null
          especie: string | null
          id: string
          lote: string | null
          lote_vacina: string | null
          proximo_reforco: string | null
          updated_at: string
          vacina: string
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          data?: string
          dose?: string | null
          especie?: string | null
          id?: string
          lote?: string | null
          lote_vacina?: string | null
          proximo_reforco?: string | null
          updated_at?: string
          vacina: string
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          data?: string
          dose?: string | null
          especie?: string | null
          id?: string
          lote?: string | null
          lote_vacina?: string | null
          proximo_reforco?: string | null
          updated_at?: string
          vacina?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacinacoes_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas_animais: {
        Row: {
          created_at: string
          data: string
          especie: string | null
          gta: string | null
          id: string
          observacoes: string | null
          parceiro_id: string | null
          quantidade: number
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          data?: string
          especie?: string | null
          gta?: string | null
          id?: string
          observacoes?: string | null
          parceiro_id?: string | null
          quantidade?: number
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          data?: string
          especie?: string | null
          gta?: string | null
          id?: string
          observacoes?: string | null
          parceiro_id?: string | null
          quantidade?: number
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_animais_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      estoque_saldo: {
        Row: {
          categoria: string | null
          estoque_minimo: number | null
          nome: string | null
          produto_id: string | null
          saldo: number | null
          unidade: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_finance: { Args: never; Returns: boolean }
      can_operate: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gestor: { Args: never; Returns: boolean }
      saldo_produto: { Args: { _produto_id: string }; Returns: number }
    }
    Enums: {
      app_role: "gestor" | "financeiro" | "operador" | "consulta"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["gestor", "financeiro", "operador", "consulta"],
    },
  },
} as const
