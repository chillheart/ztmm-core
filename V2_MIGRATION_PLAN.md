# V2 Migration Plan - Maturity Model Refactor

**Branch:** `feature/maturity-model-refactor`  
**Date:** October 24, 2025  
**Status:** Foundation Complete, UI Migration In Progress

---

## Executive Summary

This document outlines the migration strategy from the V1 flat data model to the V2 hierarchical maturity model. The V2 model introduces:
- **ProcessTechnologyGroup**: Groups implementations across multiple maturity stages
- **MaturityStageImplementation**: Stage-specific implementation details
- **Assessment**: Tracks achieved vs. target maturity with granular stage details
- **StageImplementationDetail**: Per-stage completion tracking

---

## Current Status ✅

### Completed Foundation (Commits)

1. **V2 TypeScript Interfaces** (commit 736a46b)
   - ProcessTechnologyGroup, MaturityStageImplementation
   - Assessment, StageImplementationDetail
   - ExportedData with dual-format support

2. **IndexedDB Schema v2** (commit f9d063b)
   - Database version upgraded to 2
   - V2 object stores with proper indexes
   - Complete CRUD operations for all V2 entities
   - V1 stores preserved for backward compatibility

3. **Data Migration Service** (commit fa7280c)
   - V1 → V2 transformation logic
   - Validation and dry-run support
   - Rollback capability
   - 12 passing tests

4. **Data Import/Export** (commit f7e93db)
   - Export V2 format only (version '2.0.0')
   - Import both V1 and V2 formats
   - Auto-migration on V1 import
   - Version detection from structure
   - 28 passing tests

5. **Service Abstraction Layer** (commit db3f714)
   - ProcessService for Process-type entities
   - TechnologyService for Technology-type entities
   - Type-specific filtering and validation
   - Cascading delete operations
   - 60 passing tests (30 each)

6. **Phase 4: Assessment V2 Integration** (commit 4b080ef)
   - V2 assessment workflow fully integrated
   - V1/V2 dual-mode operation
   - All 491 tests passing

7. **Phase 5: Reporting V2 Support** (commit 510b6e3)
   - V2 reporting fully functional
   - Dual V1/V2 detection and display
   - All 509 tests passing

8. **Phase 6: V1 Deprecation** (commits abb88f4, 3a2c81c) ✅ **COMPLETE**
   - Removed V1 operational UI code
   - V2 is now the default and only operational model
   - V1 import functionality preserved
   - All 491 tests passing

**Test Coverage:** 491/491 tests passing ✅

---

## Migration Strategy

### Approach: **Phased Migration with Parallel Operation**

The application will support both V1 and V2 data models simultaneously during the transition period. This approach:
- ✅ Minimizes risk of data loss
- ✅ Allows gradual feature migration
- ✅ Enables rollback if issues arise
- ✅ Provides time for user testing
- ✅ Maintains production stability

### V1/V2 Coexistence Period

**Duration:** Until all components fully support V2 (estimated 4-6 phases)

**Data Storage:**
- V1 stores: `technologiesProcesses`, `assessmentResponses` (read-only after V2 data created)
- V2 stores: `processTechnologyGroups`, `maturityStageImplementations`, `assessments`, `stageImplementationDetails`

**Data Flow:**
- **Import:** Accept both V1 and V2, auto-migrate V1 → V2
- **Export:** V2 format only
- **Migration:** On-demand via DataMigrationService
- **Fallback:** V1 data preserved, can be re-migrated if needed

---

## Phase Implementation Plan

### Phase 1: Configuration UI for V2 Data Creation ⬅️ **START HERE**

**Goal:** Enable administrators to create V2 ProcessTechnologyGroup entities

**Components to Update:**
- `admin.component.ts` - Main admin controller
- `technologies-tab.component.ts` - Technology/Process management UI
- `functions-tab.component.ts` - Function capability context
- `pillars-tab.component.ts` - Pillar management (minor updates)

**Changes Required:**

1. **TechnologiesTabComponent**
   - Replace `addTechnologyProcess()` with `ProcessService.addProcess()` / `TechnologyService.addTechnology()`
   - Add stage selection interface (multi-stage support)
   - Update list view to show V2 ProcessTechnologyGroups
   - Add "Migrate V1 Data" button for admin

2. **AdminComponent**
   - Inject ProcessService and TechnologyService
   - Update data loading to fetch V2 entities
   - Maintain V1 display for comparison (temporary)
   - Add migration status indicator

3. **Data Display**
   - Show ProcessTechnologyGroups grouped by function
   - Display associated MaturityStageImplementations
   - Indicate which stages are defined
   - Show migration status (V1 only / V2 available / V2 only)

**Testing:**
- Update admin.component.spec.ts with new service mocks
- Test V2 entity creation
- Test migration trigger
- Verify V1 data preservation

**Success Criteria:**
- ✅ Can create V2 ProcessTechnologyGroup entities
- ✅ Can associate multiple MaturityStageImplementations
- ✅ V1 data remains accessible
- ✅ Migration can be triggered from UI
- ✅ All existing tests pass

**Estimated Effort:** 8-12 hours

---

### Phase 2: Demo Data Generator V2 Support

**Goal:** Generate realistic V2 sample data for testing and demonstrations

**Components to Update:**
- `demo-data-generator.service.ts`
- `demo-data-generator.service.spec.ts`

**Changes Required:**

1. **DemoDataGeneratorService**
   - Create ProcessTechnologyGroups instead of TechnologyProcess entities
   - Generate MaturityStageImplementations for each stage
   - Create sample Assessment entities
   - Add StageImplementationDetails with varied completion states

2. **Sample Data Patterns**
   - Traditional stage: 20% of items fully implemented
   - Initial stage: 40% of items fully implemented
   - Advanced stage: 30% of items partially implemented
   - Optimal stage: 10% of items planned (target only)

**Testing:**
- Verify V2 data generation
- Ensure data relationships are correct
- Test with ProcessService/TechnologyService
- Validate data can be assessed and reported

**Success Criteria:**
- ✅ Generates complete V2 data structure
- ✅ Creates realistic maturity progression patterns
- ✅ Data is valid for assessment workflow
- ✅ All tests pass

**Estimated Effort:** 4-6 hours

---

### Phase 3: V2 Assessment UI Components

**Goal:** Build new assessment interface for V2 model with stage-based progression

**New Components to Create:**
- `v2-assessment-item.component.ts` - Individual assessment UI
- `v2-assessment-stage-selector.component.ts` - Stage selection
- `v2-assessment-detail-tracker.component.ts` - Detail tracking
- `maturity-progress-visualizer.component.ts` - Visual progress

**Existing Components to Update:**
- `assessment.component.ts` - Add V2 mode toggle
- `assessment-overview.component.ts` - Show both V1 and V2 data

**Features:**

1. **Stage-Based Assessment**
   - Select ProcessTechnologyGroup
   - Display all MaturityStageImplementations
   - Mark achieved stage (highest completed)
   - Set target stage (currently working on)

2. **Implementation Detail Tracking**
   - Per-stage completion percentage
   - Status: Not Started / In Progress / Completed
   - Notes field for each stage
   - Visual indicators for completion

3. **Assessment Workflow**
   - Create new Assessment
   - Update existing Assessment
   - Track achieved vs. target stages
   - Save StageImplementationDetails

4. **Data Visualization**
   - Maturity progression timeline
   - Stage completion indicators
   - Achieved vs. target highlighting
   - Overall progress percentage

**Testing:**
- Component unit tests
- Integration tests with services
- User workflow testing
- Edge case handling

**Success Criteria:**
- ✅ Can assess V2 ProcessTechnologyGroups
- ✅ Stage progression is clear and intuitive
- ✅ Detail tracking captures granular status
- ✅ Assessments save correctly
- ✅ UI is responsive and accessible
- ✅ All tests pass

**Estimated Effort:** 12-16 hours

---

#### Phase 4: Update Assessment Components for V2 ✅ COMPLETE
**Status:** Complete - V2 assessment workflow fully integrated  
**Estimated Time:** 10-14 hours  
**Actual Time:** ~12 hours  
**Completion:** 100%  
**Commit:** 4b080ef

**Objective:** Add V2 support to existing assessment workflow while maintaining V1 functionality

**Tasks:**
- [x] Add V2 data loading to assessment.component.ts
- [x] Create V2 assessment overview component
- [x] Update assessment-item for V2 multi-stage support
- [x] Implement V2 progress calculations
- [x] Add V1/V2 mode toggle in UI
- [x] Update overall-progress-summary for V2
- [x] Test assessment workflow with V2 data
- [x] Maintain backward compatibility with V1

---

### Phase 5: Reporting V2 Support

**Goal:** Update reporting engine to analyze and visualize V2 data

**Components to Update:**
- `report-data.service.ts` - Data aggregation logic
- `reports.component.ts` - Main report view
- `pillar-overview.component.ts` - Pillar-level reports
- `pillar-detail.component.ts` - Detailed pillar analysis
- `function-detail.component.ts` - Function-level breakdown
- `report-export.component.ts` - Export functionality

**Changes Required:**

1. **ReportDataService**
   - Aggregate V2 Assessment data
   - Calculate maturity distribution per pillar
   - Track stage progression trends
   - Compute achieved vs. target gaps

2. **Report Visualizations**
   - Maturity progression timeline
   - Stage completion heat maps
   - Achieved vs. target comparison charts
   - Gap analysis diagrams
   - Implementation velocity metrics

3. **Report Types**
   - **Executive Summary**: Overall maturity posture
   - **Pillar Deep Dive**: Per-pillar stage analysis
   - **Function Analysis**: Function-level maturity tracking
   - **Gap Report**: Achieved vs. target gaps
   - **Progress Report**: Historical progression tracking

4. **Export Formats**
   - PDF with V2 data visualizations
   - Excel with stage-level detail
   - JSON with complete V2 structure
   - CSV with flattened assessment data

**Testing:**
- Report accuracy validation
- Visual regression testing
- Export format verification
- Performance testing with large datasets

**Success Criteria:**
- ✅ Reports show V2 data accurately
- ✅ Visualizations are clear and intuitive
- ✅ Exports contain complete V2 information
- ✅ Performance is acceptable
- ✅ All tests pass

**Estimated Effort:** 12-16 hours

---

### Phase 6: V1 Deprecation and Cleanup ✅ **COMPLETE**

**Status:** Complete - V1 operational code removed, import functionality preserved  
**Completion Date:** October 27, 2025  
**Commits:** abb88f4, 3a2c81c

**Goal:** Remove V1 operational code while preserving import functionality for backwards compatibility

**Completed Tasks:**

1. **✅ V1 UI Removal**
   - Removed useV2Model toggle from AssessmentComponent
   - Removed useV2Model toggle from AdminComponent  
   - Removed useV2Model toggle from ReportsComponent
   - Deleted V1 UI components (12 files):
     * technologies-tab.component.* (4 files)
     * assessment-overview.component.* (4 files)
     * assessment-item.component.* (4 files)
   - **Impact:** -1,529 lines of V1 code removed

2. **✅ V1 Method Deprecation**
   - Added @deprecated JSDoc tags to 8 V1 IndexedDB methods:
     * getTechnologiesProcesses()
     * getAllTechnologiesProcesses()
     * getTechnologiesProcessesByFunction()
     * addTechnologyProcess()
     * editTechnologyProcess()
     * removeTechnologyProcess()
     * saveAssessment()
     * getAssessmentResponses()
   - Methods remain functional for import scenarios
   - Documentation directs developers to V2 services

3. **✅ Test Updates**
   - Updated all tests to V2-only assumptions
   - Fixed test spies to include V2 methods
   - Updated mock data to V2 structures
   - Fixed method name changes (buildV2PillarSummary)
   - Updated version expectations to '2.0.0'
   - **Result:** All 491 tests passing ✅

4. **✅ Data Model Updates**
   - AssessmentComponent.loadAll() now loads V2 data
   - DataExportService.getDataStatistics() always returns version '2.0.0'
   - V2 is now the default and only operational model

**Preserved V1 Functionality:**
- ✅ DataMigrationService (~500 lines) - Full V1 to V2 migration logic
- ✅ DataExportService V1 import detection and auto-migration
- ✅ V1 TypeScript interfaces (marked @deprecated)
- ✅ V1 IndexedDB methods (marked @deprecated, fully functional)
- ✅ V1 data stores in database schema (for imported data)

**Success Criteria:** ✅ ALL MET
- ✅ V1 operational UI removed
- ✅ V2 is the only active model
- ✅ V1 import functionality works
- ✅ All tests pass (491/491)
- ✅ Build succeeds
- ✅ No breaking changes for V1 data import

**Estimated Effort:** 8-10 hours  
**Actual Effort:** ~10 hours  
**Completion:** 100%

---

### Phase 7: Documentation and User Guide 🔄 **IN PROGRESS**

**Goal:** Update documentation to reflect V2-only model and V1 import process

**Tasks:**
- [x] Update V2_MIGRATION_PLAN.md with Phase 6 completion
- [x] Document @deprecated methods
- [ ] Create "Importing V1 Data" section
- [ ] Update README.md with V2 model explanation
- [ ] Document migration process for users
- [ ] Create developer guide for V2 model

---

## Importing V1 Data (Legacy Support)

### Overview
While V2 is now the only operational model, the application maintains full support for importing V1 data. When V1 data is imported, it is automatically migrated to V2 format using the DataMigrationService.

### Import Process

1. **File Selection**
   - Navigate to Configuration → Admin → Import/Export
   - Select a JSON file containing V1 or V2 data
   - System automatically detects data version

2. **Automatic V1 Detection**
   ```typescript
   // V1 files contain these fields
   {
     "version": "1.0.0",
     "technologiesProcesses": [...],  // V1 indicator
     "assessmentResponses": [...]
   }
   ```

3. **Auto-Migration**
   - DataMigrationService.migrateV1ToV2() is called automatically
   - V1 data is transformed to V2 structure
   - Original V1 data is preserved in V1 stores
   - V2 data is written to V2 stores

4. **Migration Mapping**
   ```
   V1 TechnologyProcess → V2 ProcessTechnologyGroup
   - Single maturity_stage_id → MaturityStageImplementation per stage
   - Assessment created with achieved_maturity_stage_id
   
   V1 AssessmentResponse → V2 Assessment
   - status mapped to implementation_status
   - notes preserved
   - achieved_maturity_stage_id set based on V1 stage
   ```

5. **Validation**
   - Migration validates data integrity
   - Checks for orphaned references
   - Verifies all V1 data was migrated
   - Logs any issues to console

### Deprecated V1 Methods

The following IndexedDBService methods are deprecated but remain functional for import scenarios:

| Method | Purpose | V2 Alternative |
|--------|---------|----------------|
| `getTechnologiesProcesses()` | Fetch V1 tech/processes | ProcessService + TechnologyService |
| `getAllTechnologiesProcesses()` | Fetch all V1 items | ProcessService.getAllProcesses() + TechnologyService.getAllTechnologies() |
| `getTechnologiesProcessesByFunction()` | Filter by function | ProcessService.getProcessesByFunction() + TechnologyService.getTechnologiesByFunction() |
| `addTechnologyProcess()` | Create V1 item | ProcessService.addProcess() or TechnologyService.addTechnology() |
| `editTechnologyProcess()` | Update V1 item | ProcessService.updateProcess() or TechnologyService.updateTechnology() |
| `removeTechnologyProcess()` | Delete V1 item | ProcessService.deleteProcess() or TechnologyService.deleteTechnology() |
| `saveAssessment()` | Save V1 assessment | IndexedDBService.addAssessmentV2() |
| `getAssessmentResponses()` | Fetch V1 assessments | IndexedDBService.getAssessmentsV2() |

**⚠️ Important:** Do not use deprecated methods for new development. They are preserved only for data import and migration scenarios.

### Developer Guidelines

**When to use V1 methods:**
- ❌ Never for new feature development
- ❌ Never for creating new data
- ✅ Only in DataMigrationService for imports
- ✅ Only in DataExportService for legacy detection

**When to use V2 methods:**
- ✅ All new assessments
- ✅ All configuration changes
- ✅ All reporting and analytics
- ✅ All UI components

### Troubleshooting V1 Imports

**Issue: Import fails with validation errors**
- Check V1 data structure matches expected format
- Verify all referenced IDs exist
- Check console for detailed error messages

**Issue: Migrated data looks incorrect**
- Review migration logs in console
- Check V1 → V2 mapping (see above)
- Verify source V1 data integrity

**Issue: Can't see imported data**
- Refresh the application
- Check that V2 components are being used (not V1)
- Verify migration completed successfully

---

## Testing Strategy

### Unit Tests
- Each modified component has corresponding .spec.ts
- Mock ProcessService and TechnologyService
- Test V2 data structures
- Verify service method calls

### Integration Tests
- Test component interactions with services
- Verify data flow through V2 model
- Test assessment workflow end-to-end
- Validate report generation

### Migration Tests
- Test V1 → V2 migration with various data sets
- Verify data integrity after migration
- Test rollback procedures
- Validate import/export with mixed versions

### User Acceptance Tests
- Manual testing of all workflows
- V1 vs. V2 comparison
- Migration user experience
- Report accuracy validation

---

## Risk Management

### Risk: Data Loss During Migration
**Mitigation:**
- Preserve V1 stores during migration
- Implement rollback capability
- Require data backup before migration
- Test migration extensively

### Risk: Performance Degradation
**Mitigation:**
- Proper indexing on V2 stores
- Lazy loading of related entities
- Paginated data loading
- Query optimization

### Risk: User Confusion (V1 vs. V2)
**Mitigation:**
- Clear UI indicators of data version
- Migration prompts and guidance
- Documentation and training
- Gradual rollout

### Risk: Incomplete Migration
**Mitigation:**
- Validation checks post-migration
- Visual comparison tools
- Detailed migration logs
- Support for re-migration

---

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**
   - Revert to V1 components
   - V1 data is preserved and functional
   - No data loss occurs

2. **Partial Rollback**
   - Keep V2 infrastructure
   - Disable V2 UI components
   - Continue using V1 assessment workflow
   - Investigate and fix issues

3. **Data Rollback**
   - Re-import V1 data if needed
   - V1 stores are never deleted
   - Can re-run migration after fixes

---

## Success Metrics

### Technical Metrics
- ✅ 0 data loss incidents
- ✅ <100ms average query time for V2 data
- ✅ 100% test coverage for new components
- ✅ 0 critical bugs in production

### User Metrics
- ✅ <5% increase in assessment completion time
- ✅ >80% user satisfaction with V2 UI
- ✅ <2 support tickets per 100 migrations
- ✅ 0 rollbacks required

### Business Metrics
- ✅ Complete V2 migration within estimated effort
- ✅ No production downtime
- ✅ Improved maturity tracking granularity
- ✅ Enhanced reporting capabilities

---

## Timeline Estimate

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| **Foundation** | Models, DB, Services | 40-50 hours | ✅ **Complete** |
| **Phase 1** | Configuration UI | 8-12 hours | ✅ **Complete** |
| **Phase 2** | Demo Data Generator | 4-6 hours | ✅ **Complete** |
| **Phase 3** | V2 Assessment UI | 12-16 hours | ✅ **Complete** |
| **Phase 4** | Assessment Integration | 10-14 hours | ✅ **Complete** |
| **Phase 5** | Reporting V2 | 12-16 hours | ✅ **Complete** |
| **Phase 6** | V1 Deprecation | 8-10 hours | ✅ **Complete** |
| **Phase 7** | Documentation | 4-6 hours | 🔄 **In Progress** |
| **Testing** | UAT & Polish | 8-12 hours | ⏳ **Pending** |

**Total Effort:** ~120 hours (Foundation through Phase 6)  
**Remaining:** ~12-18 hours (Phase 7 + UAT)

---

## Next Steps

1. ✅ ~~Review and approve this migration plan~~
2. ✅ ~~Phase 1: Update configuration UI for V2 data creation~~
3. ✅ ~~Phase 2: Demo Data Generator V2 Support~~
4. ✅ ~~Phase 3: V2 Assessment UI Components~~
5. ✅ ~~Phase 4: Assessment Integration~~
6. ✅ ~~Phase 5: Reporting V2 Support~~
7. ✅ ~~Phase 6: V1 Deprecation and Cleanup~~
8. 🔄 **Phase 7: Complete documentation** ⬅️ **CURRENT**
9. ⏳ **User Acceptance Testing** - Manual testing of all workflows
10. ⏳ **Production Release** - Deploy V2-only application

---

## Questions for Discussion

1. **Timeline**: Is the estimated 62-86 hour timeline acceptable?
2. **Feature Flag**: Should we add a feature flag to control V2 UI availability?
3. **User Communication**: How should we communicate V2 changes to users?
4. **Training**: Do users need training materials for V2 model?
5. **Staging**: Is a staging environment available for migration testing?
6. **Rollout**: Gradual rollout vs. big-bang release?

---

## Appendix

### V1 → V2 Data Model Mapping

```
V1: TechnologyProcess
- id
- name
- description
- type (Technology | Process)
- function_capability_id
- maturity_stage_id          ← Single stage

V2: ProcessTechnologyGroup
- id
- name
- description
- type (Technology | Process)
- function_capability_id
- order_index

V2: MaturityStageImplementation ← Multiple per group
- id
- process_technology_group_id
- maturity_stage_id
- description
- order_index

V2: Assessment
- id
- process_technology_group_id
- achieved_maturity_stage_id  ← Completed stage
- target_maturity_stage_id    ← In-progress stage
- implementation_status
- notes
- last_updated

V2: StageImplementationDetail ← Granular tracking
- id
- assessment_id
- maturity_stage_id
- status
- completion_percentage
- notes
```

### Key Architectural Decisions

1. **Unified Model**: Single ProcessTechnologyGroup type with discriminator
2. **Service Layer**: Type-specific services (ProcessService, TechnologyService)
3. **Migration**: Auto-migration on V1 import, manual trigger available
4. **Export Strategy**: V2 only to encourage adoption
5. **Backward Compatibility**: V1 stores preserved, read-only after migration

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Next Review:** After Phase 1 completion
