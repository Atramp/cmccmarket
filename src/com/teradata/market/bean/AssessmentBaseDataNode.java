package com.teradata.market.bean;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by alex on 16/1/21.
 */
public class AssessmentBaseDataNode {

    private class Data {
        private String branch;
        private String value;

        public String getBranch() {
            return branch;
        }

        public void setBranch(String branch) {
            this.branch = branch;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

    String ID;
    String parID;
    String name;
    String type;
    String kpi;
    String index;
    List<AssessmentBaseDataNode> children;
    List<Data> datas;

    public AssessmentBaseDataNode() {
        this.children = new ArrayList<AssessmentBaseDataNode>();
        this.datas = new ArrayList<Data>();
    }

    public String getID() {
        return ID;
    }

    public void setID(String ID) {
        this.ID = ID;
    }

    public String getParID() {
        return parID;
    }

    public void setParID(String parID) {
        this.parID = parID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getKpi() {
        return kpi;
    }

    public void setKpi(String kpi) {
        this.kpi = kpi;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }

    public List<AssessmentBaseDataNode> getChildren() {
        return children;
    }

    public void setChildren(List<AssessmentBaseDataNode> children) {
        this.children = children;
    }

    public List<Data> getDatas() {
        return datas;
    }

    public void setDatas(List<Data> datas) {
        this.datas = datas;
    }

    public AssessmentBaseDataNode addChild(AssessmentBaseDataNode node) {
        this.children.add(node);
        return node;
    }

    public Data addData(String branch, String value) {
        Data data = new Data();
        data.setBranch(branch);
        data.setValue(value);
        this.datas.add(data);
        return data;
    }
}
